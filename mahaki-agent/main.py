"""Mahaki — local voice agent entry point.

Pipeline:  listener thread ──(wake word + utterance)──▶ asyncio.Queue
           ──▶ transcribe (Whisper, executor) ──▶ orchestrate (Claude + tools)
           ──▶ speak (pyttsx3 worker thread)

The listener is muted while Mahaki speaks so it can't wake itself up.
Ctrl+C shuts everything down cleanly.
"""

import asyncio
import logging
import sys

from agent.orchestrator import Orchestrator
from agent.tools_registry import ToolRegistry
from agent.tools import pathway_alignment
from audio.listener import WakeWordListener
from audio.speaker import create_speaker
from audio.transcriber import Transcriber
from config import load_config

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)-22s %(levelname)-7s %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("mahaki")


def build_registry() -> ToolRegistry:
    """All tool wiring happens here — add new tools' register() calls below."""
    registry = ToolRegistry()
    pathway_alignment.register(registry)
    return registry


async def run() -> None:
    cfg = load_config()

    if not cfg.agent.active_api_key:
        sys.exit(
            f"No API key for LLM provider {cfg.agent.provider!r} — set the matching key "
            f"in .env (e.g. GEMINI_API_KEY for the free Gemini tier)."
        )

    loop = asyncio.get_running_loop()
    utterances: asyncio.Queue[bytes] = asyncio.Queue()

    transcriber = Transcriber(cfg.stt)
    # Load Whisper before we start listening so the first request isn't slow.
    await loop.run_in_executor(None, transcriber.load)

    orchestrator = Orchestrator(cfg.agent, build_registry())
    speaker = create_speaker(cfg.tts)

    listener = WakeWordListener(
        cfg.audio,
        cfg.wake,
        # Called from the listener thread — hop back onto the event loop.
        on_utterance=lambda pcm: loop.call_soon_threadsafe(utterances.put_nowait, pcm),
    )
    listener.start()
    log.info("Mahaki is listening (wake word: %r)", cfg.wake_word)

    try:
        while True:
            pcm = await utterances.get()
            # One bad utterance (API error, transcription hiccup) must never take
            # the whole assistant down — log it and keep listening.
            try:
                text = await transcriber.transcribe_async(pcm)
                if not text:
                    continue
                log.info("Heard: %r", text)

                reply = await orchestrator.handle(text)
                if not reply:
                    continue
                log.info("Mahaki: %r", reply)

                listener.mute()
                try:
                    await speaker.say_async(reply)
                finally:
                    listener.unmute()
            except Exception:
                log.exception("Error handling utterance — continuing to listen")
    finally:
        listener.stop()
        speaker.close()


def main() -> None:
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        log.info("Ka kite — Mahaki shutting down.")


if __name__ == "__main__":
    main()
