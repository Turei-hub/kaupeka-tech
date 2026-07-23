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
    sample_rate: int = 16_000          # openWakeWord and Whisper both want 16 kHz mono
    channels: int = 1
    # Utterance recording (after wake word fires)
    silence_threshold: int = 500       # RMS below this counts as silence
    silence_duration_s: float = 1.2    # this much continuous silence ends the utterance
    max_utterance_s: float = 15.0      # hard cap so a noisy room can't record forever
    pre_roll_s: float = 0.3            # audio kept from just before speech starts


@dataclass(frozen=True)
class WakeWordConfig:
    # Path to a custom openWakeWord .onnx model (e.g. a trained "Mahaki" model).
    # Leave unset to use the bundled "hey_jarvis" model while testing.
    model_path: str = field(default_factory=lambda: os.getenv("OWW_MODEL_PATH", ""))
    # Prediction score above which a detection is declared (0–1). The trained
    # model scores non-wake speech/noise ~0.00 (huge margin), so a lowish
    # threshold improves recall without risking false wakes. Raise toward 0.5+
    # if a noisy room produces false triggers.
    threshold: float = field(default_factory=lambda: float(os.getenv("OWW_THRESHOLD", "0.4")))


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
    # Which LLM answers: "gemini" (free tier via Google AI Studio), "anthropic",
    # or "openai". The audio layer and tools are identical across providers.
    provider: str = field(default_factory=lambda: os.getenv("LLM_PROVIDER", "gemini").strip().lower())
    anthropic_api_key: str = field(default_factory=lambda: os.getenv("ANTHROPIC_API_KEY", ""))
    gemini_api_key: str = field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    openai_api_key: str = field(default_factory=lambda: os.getenv("OPENAI_API_KEY", ""))
    # Model override; blank means each backend picks a sensible default
    # (claude-opus-4-8 / gemini-2.5-flash / gpt-4o-mini).
    model: str = field(default_factory=lambda: os.getenv("LLM_MODEL", ""))
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

    @property
    def active_api_key(self) -> str:
        """The API key for the currently selected provider."""
        return {
            "anthropic": self.anthropic_api_key,
            "gemini": self.gemini_api_key,
            "google": self.gemini_api_key,
            "openai": self.openai_api_key,
        }.get(self.provider, "")


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
