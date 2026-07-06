"""Mic capture + Porcupine wake word detection.

Runs entirely in a background thread so the asyncio side of the app never
blocks on audio I/O. When the wake word fires, the listener records one
utterance (ended by silence or a hard time cap) and hands the raw 16 kHz
mono int16 PCM to `on_utterance` — in Mahaki that callback bridges into an
asyncio.Queue via loop.call_soon_threadsafe.

pyaudio / pvporcupine are imported lazily inside start() so the agent layer
and the test suite can run on machines without audio hardware or portaudio.
"""

import logging
import struct
import threading
import time
from collections import deque
from typing import Callable

from config import AudioConfig, WakeWordConfig

log = logging.getLogger(__name__)


class WakeWordListener:
    """Background thread: wake word -> record utterance -> on_utterance(pcm_bytes)."""

    def __init__(
        self,
        audio_cfg: AudioConfig,
        wake_cfg: WakeWordConfig,
        on_utterance: Callable[[bytes], None],
        on_wake: Callable[[], None] | None = None,
    ):
        self._audio_cfg = audio_cfg
        self._wake_cfg = wake_cfg
        self._on_utterance = on_utterance
        self._on_wake = on_wake

        self._stop = threading.Event()
        self._muted = threading.Event()   # set while Mahaki is speaking
        self._thread: threading.Thread | None = None

    # -- lifecycle -----------------------------------------------------

    def start(self) -> None:
        if self._thread is not None:
            raise RuntimeError("listener already started")
        self._thread = threading.Thread(target=self._run, name="mahaki-listener", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread is not None:
            self._thread.join(timeout=5)

    def mute(self) -> None:
        """Ignore the mic (used while TTS is playing so Mahaki can't hear itself)."""
        self._muted.set()

    def unmute(self) -> None:
        self._muted.clear()

    # -- thread body ---------------------------------------------------

    def _run(self) -> None:
        import pvporcupine
        import pyaudio

        if self._wake_cfg.keyword_path:
            porcupine = pvporcupine.create(
                access_key=self._wake_cfg.access_key,
                keyword_paths=[self._wake_cfg.keyword_path],
                sensitivities=[self._wake_cfg.sensitivity],
            )
            log.info("Wake word: custom keyword file %s", self._wake_cfg.keyword_path)
        else:
            # No trained "Mahaki" .ppn yet — fall back to a built-in keyword
            # so the rest of the pipeline can be exercised.
            porcupine = pvporcupine.create(
                access_key=self._wake_cfg.access_key,
                keywords=[self._wake_cfg.fallback_builtin_keyword],
                sensitivities=[self._wake_cfg.sensitivity],
            )
            log.warning(
                "PORCUPINE_KEYWORD_PATH not set — using built-in wake word %r. "
                "Train 'Mahaki' at https://console.picovoice.ai and set the path in .env.",
                self._wake_cfg.fallback_builtin_keyword,
            )

        pa = pyaudio.PyAudio()
        stream = pa.open(
            rate=porcupine.sample_rate,
            channels=self._audio_cfg.channels,
            format=pyaudio.paInt16,
            input=True,
            frames_per_buffer=porcupine.frame_length,
        )

        try:
            while not self._stop.is_set():
                pcm_bytes = stream.read(porcupine.frame_length, exception_on_overflow=False)
                if self._muted.is_set():
                    continue
                pcm = struct.unpack_from("h" * porcupine.frame_length, pcm_bytes)
                if porcupine.process(pcm) >= 0:
                    log.info("Wake word detected")
                    if self._on_wake:
                        self._on_wake()
                    utterance = self._record_utterance(stream, porcupine.frame_length)
                    if utterance:
                        self._on_utterance(utterance)
        finally:
            stream.close()
            pa.terminate()
            porcupine.delete()

    def _record_utterance(self, stream, frame_length: int) -> bytes:
        """Record until sustained silence or the max-utterance cap."""
        cfg = self._audio_cfg
        frame_s = frame_length / cfg.sample_rate
        max_frames = int(cfg.max_utterance_s / frame_s)
        silence_frames_needed = int(cfg.silence_duration_s / frame_s)
        pre_roll: deque[bytes] = deque(maxlen=int(cfg.pre_roll_s / frame_s))

        frames: list[bytes] = []
        silent_run = 0
        heard_speech = False
        start = time.monotonic()

        for _ in range(max_frames):
            if self._stop.is_set():
                break
            chunk = stream.read(frame_length, exception_on_overflow=False)
            rms = _rms(chunk)

            if not heard_speech:
                pre_roll.append(chunk)
                if rms >= cfg.silence_threshold:
                    heard_speech = True
                    frames.extend(pre_roll)
                elif time.monotonic() - start > 3.0:
                    log.info("No speech after wake word — giving up")
                    return b""
                continue

            frames.append(chunk)
            silent_run = silent_run + 1 if rms < cfg.silence_threshold else 0
            if silent_run >= silence_frames_needed:
                break

        return b"".join(frames)


def _rms(pcm_bytes: bytes) -> float:
    samples = struct.unpack_from("h" * (len(pcm_bytes) // 2), pcm_bytes)
    if not samples:
        return 0.0
    return (sum(s * s for s in samples) / len(samples)) ** 0.5
