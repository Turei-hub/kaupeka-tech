"""Local speech-to-text via faster-whisper.

`transcribe()` is blocking (CPU-bound model inference) — callers on the
asyncio side should run it in an executor, which is what
`transcribe_async()` does for them.

faster-whisper is imported lazily so the agent layer and tests don't need
the model or its native deps installed.
"""

import asyncio
import logging

import numpy as np

from config import SttConfig

log = logging.getLogger(__name__)


class Transcriber:
    def __init__(self, cfg: SttConfig):
        self._cfg = cfg
        self._model = None

    def load(self) -> None:
        """Load the Whisper model up front (first call downloads it)."""
        if self._model is None:
            from faster_whisper import WhisperModel

            log.info("Loading faster-whisper model %r (%s/%s)…",
                     self._cfg.model_size, self._cfg.device, self._cfg.compute_type)
            self._model = WhisperModel(
                self._cfg.model_size,
                device=self._cfg.device,
                compute_type=self._cfg.compute_type,
            )
            log.info("Whisper model ready")

    def transcribe(self, pcm_bytes: bytes) -> str:
        """16 kHz mono int16 PCM -> text. Blocking."""
        self.load()
        audio = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        segments, _info = self._model.transcribe(
            audio,
            language=self._cfg.language,
            beam_size=1,          # greedy — fastest on CPU, fine for short commands
            vad_filter=True,      # trims residual silence around the utterance
        )
        text = " ".join(seg.text.strip() for seg in segments).strip()
        log.info("Transcribed: %r", text)
        return text

    async def transcribe_async(self, pcm_bytes: bytes) -> str:
        return await asyncio.get_running_loop().run_in_executor(
            None, self.transcribe, pcm_bytes
        )
