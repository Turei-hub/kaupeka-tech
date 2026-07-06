"""Central configuration for Mahaki.

Everything tunable lives here — wake word, model paths, voice settings —
so no module hardcodes its own values. Secrets come from .env.
"""

import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class AudioConfig:
    sample_rate: int = 16_000          # Porcupine and Whisper both want 16 kHz mono
    channels: int = 1
    # Utterance recording (after wake word fires)
    silence_threshold: int = 500       # RMS below this counts as silence
    silence_duration_s: float = 1.2    # this much continuous silence ends the utterance
    max_utterance_s: float = 15.0      # hard cap so a noisy room can't record forever
    pre_roll_s: float = 0.3            # audio kept from just before speech starts


@dataclass(frozen=True)
class WakeWordConfig:
    access_key: str = field(default_factory=lambda: os.getenv("PICOVOICE_ACCESS_KEY", ""))
    # Path to the custom "Mahaki" .ppn trained on https://console.picovoice.ai
    # (Porcupine has no built-in "Mahaki"). Until that file exists, we fall
    # back to the built-in keyword below so the pipeline can be tested.
    keyword_path: str = field(default_factory=lambda: os.getenv("PORCUPINE_KEYWORD_PATH", ""))
    fallback_builtin_keyword: str = "porcupine"
    sensitivity: float = 0.6


@dataclass(frozen=True)
class SttConfig:
    # faster-whisper model size: tiny/base/small/medium/large-v3.
    # "base" is a good CPU latency/accuracy trade-off; bump to "small" if
    # NZ-accented speech transcribes poorly.
    model_size: str = field(default_factory=lambda: os.getenv("WHISPER_MODEL", "base"))
    device: str = "cpu"
    compute_type: str = "int8"         # int8 quantisation keeps CPU inference quick
    language: str = "en"


@dataclass(frozen=True)
class TtsConfig:
    engine: str = field(default_factory=lambda: os.getenv("TTS_ENGINE", "pyttsx3"))
    rate: int = 180                    # words per minute
    volume: float = 1.0
    voice_id: str = field(default_factory=lambda: os.getenv("TTS_VOICE_ID", ""))


@dataclass(frozen=True)
class AgentConfig:
    anthropic_api_key: str = field(default_factory=lambda: os.getenv("ANTHROPIC_API_KEY", ""))
    model: str = field(default_factory=lambda: os.getenv("CLAUDE_MODEL", "claude-opus-4-8"))
    max_tokens: int = 1024
    max_tool_rounds: int = 5           # safety cap on tool-use loops per request
    history_turns: int = 12            # rolling conversation memory (user+assistant messages)
    system_prompt: str = (
        "You are Mahaki, a local voice assistant for Turei Milner of Kaupeka Tech. "
        "Your replies are spoken aloud by a TTS engine, so keep them short, "
        "conversational, and free of markdown, bullet lists, or code blocks. "
        "Use the tools available to you when a request matches one. "
        "If you don't know something, say so briefly."
    )


@dataclass(frozen=True)
class MahakiConfig:
    wake_word: str = "Mahaki"
    audio: AudioConfig = field(default_factory=AudioConfig)
    wake: WakeWordConfig = field(default_factory=WakeWordConfig)
    stt: SttConfig = field(default_factory=SttConfig)
    tts: TtsConfig = field(default_factory=TtsConfig)
    agent: AgentConfig = field(default_factory=AgentConfig)


def load_config() -> MahakiConfig:
    return MahakiConfig()
