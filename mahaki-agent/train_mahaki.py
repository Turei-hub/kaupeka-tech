#!/usr/bin/env python
"""Train a custom 'Mahaki' wake-word ONNX model for openWakeWord.

Data pipeline:
  1. Synthesise ~200 'Mahaki' clips via Windows SAPI5 TTS (pyttsx3),
     at several speaking rates for every installed voice.
  2. Augment each clip with noise, speed, and volume variation.
  3. Optionally merge real recordings (--extra-recordings DIR of .wav files).
  4. Generate negative examples: white/pink noise + random non-wake-word speech.
  5. Extract 16×96 embeddings using openWakeWord's pretrained feature models.
  6. Train a tiny DNN binary classifier (PyTorch, CPU only).
  7. Export to models/mahaki.onnx and update OWW_MODEL_PATH in .env.

Usage:
    python train_mahaki.py
    python train_mahaki.py --extra-recordings ./my_recordings/ --epochs 500
"""

import argparse
import os
import random
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import scipy.io.wavfile
import scipy.signal
import torch
import torch.nn as nn
from torch import optim
from tqdm import tqdm

import pyttsx3
from openwakeword.utils import AudioFeatures, download_models

# -- constants --------------------------------------------------------------
SAMPLE_RATE = 16_000
EMBEDDING_DIM = 96
CONTEXT_FRAMES = 16          # wake-word model sees 16 consecutive embeddings
MODEL_OUT = Path("models/mahaki.onnx")

# SAPI5 speaking rates (words per minute) to use per voice
SAPI5_RATES = [130, 150, 170, 190, 210]

# Words used to generate non-wake-word speech negatives. These teach the model
# that ordinary speech is NOT the wake word — without enough of them it learns
# only "speech vs. silence" and fires on every sentence.
NEGATIVE_WORDS = [
    "hello", "goodbye", "okay", "computer", "music", "start", "stop",
    "play", "volume", "weather", "timer", "alarm", "lights on", "lights off",
    "what time is it", "set a reminder", "good morning", "thank you",
    "navigate home", "call mum", "turn it up", "can you hear me",
    "machine learning", "open browser", "close window", "take a photo",
    "how are you", "see you later", "let's go", "one moment", "no worries",
    "kia ora", "tell me a joke", "what's the news", "add to the list",
    "send a message", "pause the video", "next song", "call the office",
]

# Phonetically NEAR "Mahaki" — the hardest negatives. Teaching the model to
# reject these carves a tight boundary around the real word instead of firing
# on anything vaguely similar. Weighted heavily during training.
HARD_NEGATIVES = [
    "khaki", "hockey", "mahogany", "monarchy", "maharaja", "malachi",
    "makara", "mahi", "haka", "karaoke", "my car key", "smoky",
    "already", "wasabi", "tobacco", "harmony", "macaque", "mocha",
]


# -- audio helpers ----------------------------------------------------------

def read_wav_16k(path: str) -> np.ndarray:
    """Read any WAV file → float32 mono at 16 kHz in [-1, 1]."""
    sr, data = scipy.io.wavfile.read(path)
    if data.ndim > 1:
        data = data[:, 0]
    # Normalise to float32 [-1, 1] based on original dtype
    if data.dtype == np.int16:
        data = data.astype(np.float32) / 32768.0
    elif data.dtype == np.int32:
        data = data.astype(np.float32) / 2147483648.0
    elif data.dtype in (np.float32, np.float64):
        data = data.astype(np.float32)
    else:
        data = data.astype(np.float32) / 32768.0
    if sr != SAMPLE_RATE:
        data = scipy.signal.resample_poly(data, SAMPLE_RATE, sr).astype(np.float32)
    return data


# -- TTS generation --------------------------------------------------------─

TTS_WORKER = Path(__file__).with_name("tts_worker.py")


def _list_voice_ids() -> list[str]:
    """Enumerate installed SAPI5 voice ids via a short-lived engine.

    Enumeration alone is safe — it's the repeated save_to_file/runAndWait
    cycle on a reused engine that deadlocks, not init/getProperty.
    """
    engine = pyttsx3.init()
    return [v.id for v in engine.getProperty("voices")]


def _synth_one(text: str, rate: int, voice_id: str,
               timeout: float = 30.0) -> np.ndarray | None:
    """Synthesise one clip in an isolated subprocess. Returns audio or None.

    Each synthesis gets a fresh process so SAPI5's COM object is released
    between clips; reusing one pyttsx3 engine across voices hangs runAndWait().
    """
    short = voice_id.rsplit("\\", 1)[-1]
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        path = f.name
    try:
        subprocess.run(
            [sys.executable, str(TTS_WORKER), path, str(rate), text, voice_id],
            timeout=timeout, check=True,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        if os.path.getsize(path) > 0:
            audio = read_wav_16k(path)
            if audio.size > SAMPLE_RATE * 0.1:   # skip empty outputs
                return audio
    except subprocess.TimeoutExpired:
        print(f"    [warn] TTS timed out ({short}, {rate} wpm) — skipped")
    except Exception as exc:
        print(f"    [warn] TTS failed ({short}, {rate} wpm): {exc}")
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass
    return None


def tts_samples(text: str, rates: list[int] = SAPI5_RATES) -> list[np.ndarray]:
    """Synthesise `text` with every installed SAPI5 voice at each rate.

    Each synthesis runs in its own subprocess: pyttsx3's SAPI5 driver
    deadlocks in runAndWait() when a single engine is reused across voices.
    """
    clips: list[np.ndarray] = []
    for voice_id in _list_voice_ids():
        for rate in rates:
            audio = _synth_one(text, rate, voice_id)
            if audio is not None:
                clips.append(audio)
    return clips


# -- augmentation ----------------------------------------------------------─

def add_noise(audio: np.ndarray, snr_db: float) -> np.ndarray:
    sig_pwr = np.mean(audio ** 2) + 1e-9
    noise_pwr = sig_pwr / (10 ** (snr_db / 10))
    return np.clip(audio + np.random.normal(0, noise_pwr ** 0.5, len(audio)), -1, 1).astype(np.float32)


def speed_perturb(audio: np.ndarray, factor: float) -> np.ndarray:
    n_out = max(1, int(len(audio) / factor))
    return scipy.signal.resample(audio, n_out).astype(np.float32)


def augment_clip(audio: np.ndarray, n: int) -> list[np.ndarray]:
    """Return the original plus n-1 augmented variants."""
    results = [audio]
    for _ in range(n - 1):
        a = audio.copy()
        a = speed_perturb(a, random.uniform(0.85, 1.18))
        a = add_noise(a, random.uniform(12, 35))
        a = np.clip(a * random.uniform(0.6, 1.4), -1, 1).astype(np.float32)
        results.append(a)
    return results


# -- negative sample generation --------------------------------------------─

def noise_clips(n: int, duration_s: float = 2.0) -> list[np.ndarray]:
    """Programmatically generated noise (no network, no files)."""
    n_samples = int(duration_s * SAMPLE_RATE)
    clips: list[np.ndarray] = []

    # White noise
    for _ in range(n // 3):
        clips.append(np.random.normal(0, 0.12, n_samples).clip(-1, 1).astype(np.float32))

    # Pink noise (IIR approximation)
    b = np.array([0.049922035, -0.095993537, 0.050612699, -0.004408786])
    a = np.array([1.0, -2.494956002, 2.017265875, -0.522189400])
    for _ in range(n // 3):
        white = np.random.normal(0, 0.12, n_samples)
        clips.append(scipy.signal.lfilter(b, a, white).clip(-1, 1).astype(np.float32))

    # Near-silence (catches false positives in quiet environments)
    for _ in range(n - 2 * (n // 3)):
        clips.append(np.random.normal(0, 0.004, n_samples).astype(np.float32))

    return clips


def speech_negative_clips(augment: int = 4) -> list[np.ndarray]:
    """Non-wake-word TTS speech for negative training examples.

    Synthesises many distinct utterances — ordinary phrases plus phonetically
    near-"Mahaki" hard negatives (weighted ×2) — across every voice at two
    rates, then augments each. This volume/variety is what forces the model to
    learn the specific word rather than "any speech".
    """
    phrases: list[str] = list(NEGATIVE_WORDS)
    # A few random multi-word combos add natural connected-speech negatives.
    for _ in range(15):
        phrases.append(" ".join(random.sample(NEGATIVE_WORDS, 3)))
    # Hard negatives count double — the boundary around "Mahaki" matters most.
    phrases.extend(HARD_NEGATIVES * 2)

    # One rate keeps the (subprocess-per-clip) TTS affordable; augment_clip's
    # speed perturbation supplies the rate/pitch variety instead.
    base: list[np.ndarray] = []
    for phrase in phrases:
        base.extend(tts_samples(phrase, rates=[170]))

    augmented: list[np.ndarray] = []
    for clip in base:
        augmented.extend(augment_clip(clip, augment))
    return augmented


# -- embedding extraction --------------------------------------------------─

def audio_to_int16(audio: np.ndarray) -> np.ndarray:
    return (audio * 32767).clip(-32768, 32767).astype(np.int16)


def embeddings_from_clip(clip: np.ndarray, feat: AudioFeatures) -> np.ndarray:
    """Return shape (N_windows, CONTEXT_FRAMES, EMBEDDING_DIM)."""
    # Ensure minimum length for the feature model (2 s)
    min_len = SAMPLE_RATE * 2
    if len(clip) < min_len:
        clip = np.concatenate([clip, np.zeros(min_len - len(clip), dtype=np.float32)])

    emb = feat._get_embeddings(audio_to_int16(clip))   # shape (N, 96)
    if len(emb) < CONTEXT_FRAMES:
        return np.empty((0, CONTEXT_FRAMES, EMBEDDING_DIM), dtype=np.float32)

    windows = np.array([emb[i:i + CONTEXT_FRAMES] for i in range(len(emb) - CONTEXT_FRAMES + 1)],
                       dtype=np.float32)
    return windows


def trim_silence(audio: np.ndarray, frame: int = 320, keep_ratio: float = 0.12) -> np.ndarray:
    """Trim leading/trailing near-silence so the spoken word fills the clip.

    Real mic recordings carry room tone before and after the word. Without
    trimming, positive_windows' "the word is at the end" assumption grabs that
    trailing silence and mislabels it positive — which teaches the model that
    quiet room tone is the wake word. The threshold is relative to the clip's
    own peak, so it adapts to loud or quiet recordings alike.
    """
    if len(audio) < frame * 2:
        return audio
    n = len(audio) // frame
    rms = np.sqrt((audio[:n * frame].reshape(n, frame) ** 2).mean(axis=1) + 1e-12)
    peak = rms.max()
    if peak <= 0:
        return audio
    voiced = np.where(rms >= keep_ratio * peak)[0]
    if len(voiced) == 0:
        return audio
    start = voiced[0] * frame
    end = min(len(audio), (voiced[-1] + 1) * frame)
    return audio[start:end]


def loudest_segment(audio: np.ndarray, seconds: float = 0.8) -> np.ndarray:
    """Return the highest-energy `seconds`-long slice — i.e. the spoken word.

    TTS clips have the word at the start, but real recordings have it anywhere
    with room tone around it. Finding the loudest slice locates the word no
    matter where it sits, so it can be aligned to the end of the context.
    """
    seg = int(SAMPLE_RATE * seconds)
    if len(audio) <= seg:
        return audio
    csum = np.concatenate([[0.0], np.cumsum(audio.astype(np.float64) ** 2)])
    window_energy = csum[seg:] - csum[:-seg]
    start = int(np.argmax(window_energy))
    return audio[start:start + seg]


def positive_windows(clip: np.ndarray, feat: AudioFeatures) -> np.ndarray:
    """
    Isolate the spoken word, pad 1.2 s silence before it, and keep the windows
    where 'Mahaki' falls at the end of the context. Aligning on the loudest
    slice (not the clip's end) is what makes real recordings work: otherwise
    their trailing room tone gets captured and mislabeled as the wake word.
    """
    word = loudest_segment(clip)
    silence = np.zeros(int(SAMPLE_RATE * 1.2), dtype=np.float32)
    padded = np.concatenate([silence, word, np.zeros(int(SAMPLE_RATE * 0.3), dtype=np.float32)])
    windows = embeddings_from_clip(padded, feat)
    if len(windows) == 0:
        return windows
    # Keep the last few windows where the word ends in the context window
    n_pos = max(1, len(windows) // 3)
    return windows[-n_pos:]


def negative_windows(clip: np.ndarray, feat: AudioFeatures) -> np.ndarray:
    return embeddings_from_clip(clip, feat)


# -- PyTorch model & training ----------------------------------------------─

class WakeWordDNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Flatten(),
            nn.Linear(CONTEXT_FRAMES * EMBEDDING_DIM, 128),
            nn.LayerNorm(128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.LayerNorm(128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid(),
        )

    def forward(self, x):
        return self.net(x)


def train_model(X_pos: np.ndarray, X_neg: np.ndarray, epochs: int) -> WakeWordDNN:
    # Balance classes: cap negatives at 6× positives
    if len(X_neg) > len(X_pos) * 6:
        idx = np.random.choice(len(X_neg), len(X_pos) * 6, replace=False)
        X_neg = X_neg[idx]

    X = np.concatenate([X_pos, X_neg], axis=0)
    y = np.concatenate([np.ones(len(X_pos)), np.zeros(len(X_neg))]).astype(np.float32)

    perm = np.random.permutation(len(X))
    X, y = X[perm], y[perm]

    X_t = torch.tensor(X, dtype=torch.float32)
    y_t = torch.tensor(y, dtype=torch.float32).unsqueeze(1)

    model = WakeWordDNN()
    opt = optim.Adam(model.parameters(), lr=1e-3)
    loss_fn = nn.BCELoss()

    print(f"  {len(X_pos)} positive / {len(X_neg)} negative windows  →  {len(X)} total")

    for epoch in tqdm(range(epochs), desc="  Training", ncols=70):
        model.train()
        perm = torch.randperm(len(X_t))
        for i in range(0, len(X_t), 64):
            xb = X_t[perm[i:i + 64]]
            yb = y_t[perm[i:i + 64]]
            opt.zero_grad()
            loss_fn(model(xb), yb).backward()
            opt.step()

        if (epoch + 1) % 100 == 0:
            model.eval()
            with torch.no_grad():
                pred = (model(X_t) >= 0.5).float()
                acc = (pred == y_t).float().mean().item()
                pos_recall = (pred[y_t == 1] == 1).float().mean().item()
            tqdm.write(f"    epoch {epoch+1:4d}  acc={acc:.3f}  recall={pos_recall:.3f}")

    return model


def export_onnx(model: WakeWordDNN, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    model.eval()
    dummy = torch.zeros(1, CONTEXT_FRAMES, EMBEDDING_DIM)
    # dynamo=False keeps the legacy TorchScript exporter, which decomposes
    # LayerNorm into primitives at opset 12 and writes a single self-contained
    # file. torch>=2.9's default (dynamo) can't down-convert LayerNormalization
    # below opset 17 and splits weights into an external .onnx.data file.
    torch.onnx.export(
        model,
        dummy,
        str(out),
        input_names=["input"],
        output_names=["mahaki"],       # openWakeWord reads this name as the class label
        dynamic_axes={"input": {0: "batch"}, "mahaki": {0: "batch"}},
        opset_version=12,
        dynamo=False,
    )
    print(f"\nExported → {out}  ({out.stat().st_size // 1024} KB)")


def update_env(model_path: Path) -> None:
    env = Path(".env")
    text = env.read_text()
    # Forward slashes: safe in .env and cross-platform (Windows backslashes would
    # break both re.sub's replacement parsing and dotenv value reading).
    new_line = f"OWW_MODEL_PATH={model_path.as_posix()}"
    # Rebuild line-by-line rather than re.sub — the model path is a literal
    # replacement, so a backslash in it must never be treated as a regex escape.
    lines, replaced = [], False
    for line in text.splitlines():
        if re.match(r"#?\s*OWW_MODEL_PATH=", line):
            lines.append(new_line)
            replaced = True
        else:
            lines.append(line)
    if not replaced:
        lines.append(new_line)
    env.write_text("\n".join(lines) + "\n")
    print(f".env updated: {new_line}")


# -- main --------------------------------------------------------------------

def main() -> None:
    # Force UTF-8 stdout so the → / × glyphs in progress messages don't crash
    # under Windows' cp1252 fallback when output is redirected to a file/pipe.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass

    parser = argparse.ArgumentParser(description="Train Mahaki wake-word model")
    parser.add_argument("--extra-recordings", metavar="DIR",
                        help="Directory of .wav files of you saying 'Mahaki' (optional but recommended)")
    parser.add_argument("--epochs", type=int, default=400,
                        help="Training epochs (default: 400)")
    parser.add_argument("--augment", type=int, default=20,
                        help="Augmented copies per base clip (default: 20)")
    args = parser.parse_args()

    random.seed(42)
    np.random.seed(42)

    print("-- Downloading / verifying openWakeWord feature models...")
    download_models()
    feat = AudioFeatures(inference_framework="onnx")

    # -- POSITIVE samples ----------------------------------------------------
    print("\n-- Generating positive 'Mahaki' clips via SAPI5 TTS...")
    base_pos = tts_samples("Mahaki")
    print(f"   {len(base_pos)} base clips from TTS")

    if args.extra_recordings:
        rec_dir = Path(args.extra_recordings)
        extra = list(rec_dir.glob("*.wav"))
        for wav in extra:
            try:
                # Trim room tone so the word — not trailing silence — fills the clip.
                base_pos.append(trim_silence(read_wav_16k(str(wav))))
            except Exception as e:
                print(f"   [warn] skipping {wav.name}: {e}")
        print(f"   {len(extra)} extra recording(s) merged → {len(base_pos)} base clips total")

    if not base_pos:
        raise RuntimeError("No positive clips generated — check that pyttsx3 / SAPI5 is working.")

    print(f"   Augmenting ×{args.augment}...")
    augmented_pos: list[np.ndarray] = []
    for clip in base_pos:
        augmented_pos.extend(augment_clip(clip, args.augment))

    print(f"   Extracting embeddings from {len(augmented_pos)} positive clips...")
    X_pos_parts: list[np.ndarray] = []
    for clip in tqdm(augmented_pos, desc="   Embedding +", ncols=70):
        w = positive_windows(clip, feat)
        if len(w):
            X_pos_parts.append(w)
    X_pos = np.concatenate(X_pos_parts, axis=0)
    print(f"   → {len(X_pos)} positive windows")

    # -- NEGATIVE samples ----------------------------------------------------
    # Speech negatives are the ones that matter: without enough of them the
    # model only learns "speech vs. silence" and wakes on any sentence. Keep
    # noise as a minority so connected speech dominates the negative set.
    print("\n-- Generating negative samples...")
    print("   Synthesising non-wake speech (this is the slow part)...")
    speech_negs = speech_negative_clips()
    noise_negs = noise_clips(n=120)
    print(f"   {len(speech_negs)} speech + {len(noise_negs)} noise negative clips. "
          f"Extracting embeddings...")

    X_neg_parts: list[np.ndarray] = []
    for clip in tqdm(speech_negs + noise_negs, desc="   Embedding −", ncols=70):
        w = negative_windows(clip, feat)
        if len(w):
            X_neg_parts.append(w)
    X_neg = np.concatenate(X_neg_parts, axis=0)
    print(f"   → {len(X_neg)} negative windows")

    # -- TRAIN --------------------------------------------------------------─
    print(f"\n-- Training ({args.epochs} epochs)...")
    model = train_model(X_pos, X_neg, args.epochs)

    # -- EXPORT --------------------------------------------------------------
    print("\n-- Exporting ONNX model...")
    export_onnx(model, MODEL_OUT)
    update_env(MODEL_OUT)

    print("\nDone. Restart main.py -- Mahaki will now wake on 'Mahaki'.")
    print("  Tip: re-run with --extra-recordings <dir> of your own voice recordings")
    print("       to improve recall for your accent.")


if __name__ == "__main__":
    main()
