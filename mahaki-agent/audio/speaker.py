"""Text-to-speech with a swappable engine interface.

`TTSEngine` is the contract; `Pyttsx3Engine` is the free/offline default.
To upgrade to a cloud voice later (ElevenLabs, OpenAI TTS, Polly…), write
another TTSEngine subclass and return it from `create_speaker()` — nothing
else in the app changes.

pyttsx3's run loop is not thread-safe across callers, so the engine lives
in one dedicated worker thread that consumes a queue. `Speaker.say_async()`
awaits completion without blocking the event loop.
"""

import asyncio
import logging
import queue
import threading
from abc import ABC, abstractmethod

from config import TtsConfig

log = logging.getLogger(__name__)


class TTSEngine(ABC):
    """Implement this to swap in a different voice backend."""

    @abstractmethod
    def speak(self, text: str) -> None:
        """Synchronously synthesise and play `text`. Called from the TTS worker thread."""

    def close(self) -> None:  # optional cleanup hook
        pass


class Pyttsx3Engine(TTSEngine):
    def __init__(self, cfg: TtsConfig):
        import pyttsx3

        self._engine = pyttsx3.init()
        self._engine.setProperty("rate", cfg.rate)
        self._engine.setProperty("volume", cfg.volume)
        if cfg.voice_id:
            self._engine.setProperty("voice", cfg.voice_id)

    def speak(self, text: str) -> None:
        self._engine.say(text)
        self._engine.runAndWait()


class Speaker:
    """Owns the TTS worker thread; safe to call from the asyncio side."""

    def __init__(self, engine: TTSEngine):
        self._engine = engine
        self._queue: queue.Queue[tuple[str, threading.Event] | None] = queue.Queue()
        self._thread = threading.Thread(target=self._run, name="mahaki-speaker", daemon=True)
        self._thread.start()

    def _run(self) -> None:
        while True:
            item = self._queue.get()
            if item is None:
                break
            text, done = item
            try:
                self._engine.speak(text)
            except Exception:
                log.exception("TTS failed for: %r", text)
            finally:
                done.set()
        self._engine.close()

    async def say_async(self, text: str) -> None:
        """Speak `text`; returns once playback has finished."""
        if not text:
            return
        done = threading.Event()
        self._queue.put((text, done))
        await asyncio.get_running_loop().run_in_executor(None, done.wait)

    def close(self) -> None:
        self._queue.put(None)
        self._thread.join(timeout=5)


def create_speaker(cfg: TtsConfig) -> Speaker:
    """Factory — extend here when adding new engines (keyed by cfg.engine)."""
    if cfg.engine == "pyttsx3":
        return Speaker(Pyttsx3Engine(cfg))
    raise ValueError(f"Unknown TTS engine: {cfg.engine!r}")
