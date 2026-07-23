#!/usr/bin/env python
"""Record voice samples of 'Mahaki' for wake-word training.

Saves numbered WAV files to ./recordings/. Pass that folder to
train_mahaki.py with --extra-recordings ./recordings/ to include
your own voice in the training data.

Usage:
    python record_samples.py              # record 30 samples
    python record_samples.py -n 50        # record 50 samples
    python record_samples.py -o my_dir    # save to a different folder
"""

import argparse
import os
import struct
import time
import wave
from pathlib import Path

SAMPLE_RATE = 16_000
CHANNELS = 1
RECORD_SECONDS = 1.8      # long enough to say "Mahaki" comfortably
COUNTDOWN = 2             # seconds of silence before each recording starts
FORMAT_WIDTH = 2          # 16-bit PCM


def record_clip(stream, chunk: int = 1280) -> bytes:
    frames = []
    n_chunks = int(SAMPLE_RATE * RECORD_SECONDS / chunk)
    for _ in range(n_chunks):
        frames.append(stream.read(chunk, exception_on_overflow=False))
    return b"".join(frames)


def save_wav(path: str, data: bytes) -> None:
    with wave.open(path, "wb") as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(FORMAT_WIDTH)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(data)


def rms(chunk: bytes) -> float:
    samples = struct.unpack_from("h" * (len(chunk) // 2), chunk)
    return (sum(s * s for s in samples) / len(samples)) ** 0.5 if samples else 0.0


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("-n", "--count", type=int, default=30,
                        help="Number of samples to record (default: 30)")
    parser.add_argument("-o", "--output", default="recordings",
                        help="Output folder (default: ./recordings)")
    args = parser.parse_args()

    out_dir = Path(args.output)
    out_dir.mkdir(exist_ok=True)

    # Find next available index so we don't overwrite existing recordings
    existing = sorted(out_dir.glob("mahaki_*.wav"))
    start_idx = len(existing) + 1

    import pyaudio
    pa = pyaudio.PyAudio()
    stream = pa.open(
        rate=SAMPLE_RATE,
        channels=CHANNELS,
        format=pyaudio.paInt16,
        input=True,
        frames_per_buffer=1280,
    )

    print(f"Recording {args.count} samples of 'Mahaki' -> {out_dir}/")
    print("Say 'Mahaki' clearly each time the prompt appears.")
    print("Vary your distance and volume slightly across recordings.")
    print("Press Ctrl+C to stop early.\n")

    try:
        for i in range(start_idx, start_idx + args.count):
            # Countdown
            for t in range(COUNTDOWN, 0, -1):
                print(f"  [{i}/{start_idx + args.count - 1}] Ready in {t}s...", end="\r")
                time.sleep(1)

            print(f"  [{i}/{start_idx + args.count - 1}] >>> Say MAHAKI now! <<<          ")
            data = record_clip(stream)

            # Quick RMS check — warn if the clip seems silent
            chunks = [data[j:j+2560] for j in range(0, len(data), 2560)]
            peak_rms = max(rms(c) for c in chunks if c)
            if peak_rms < 300:
                print("    (!) Very quiet — check your mic or speak louder")

            path = out_dir / f"mahaki_{i:03d}.wav"
            save_wav(str(path), data)
            print(f"    Saved {path.name}  (peak RMS: {peak_rms:.0f})")

    except KeyboardInterrupt:
        print("\nStopped early.")
    finally:
        stream.close()
        pa.terminate()

    saved = len(list(out_dir.glob("mahaki_*.wav")))
    print(f"\n{saved} total recordings in {out_dir}/")
    print(f"\nNext step:")
    print(f"  python train_mahaki.py --extra-recordings {out_dir}")


if __name__ == "__main__":
    main()
