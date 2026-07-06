# Mahaki — Local Voice Agent

Voice-first local AI agent for Turei Milner (Kaupeka Tech Ltd). Wake word
"Mahaki" → local Whisper STT → Claude + tools → offline TTS reply. No cloud
STT/TTS costs; the only paid API is Anthropic (reasoning layer).

Not based on the LAE Engine — separate architecture, separate purpose.

## Architecture

Two decoupled layers, on purpose:

- **Speech I/O** (`audio/`): wake word (Porcupine, background thread) →
  utterance recording (RMS silence detection) → STT (faster-whisper) →
  TTS (pyttsx3 behind a swappable `TTSEngine` interface).
- **Agent** (`agent/`): `Orchestrator` takes text, runs the Claude tool-use
  loop against a `ToolRegistry`, returns text. Zero audio knowledge.

The seam between them is `main.py`: listener thread → `asyncio.Queue` →
transcribe → orchestrate → speak. To repoint the voice layer at the A.R.E.
trading agent later, build a different registry + system prompt and hand
them to a new `Orchestrator` — don't touch `audio/`.

## Threading model

- Listener: dedicated daemon thread (blocking pyaudio reads), bridges to
  asyncio via `loop.call_soon_threadsafe`.
- STT: blocking inference, run in the default executor.
- TTS: dedicated worker thread owning the pyttsx3 engine (it isn't
  thread-safe across callers); `say_async` awaits completion.
- Listener is muted during TTS playback so Mahaki can't hear itself.

## Running it

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt   # needs portaudio + espeak-ng on Linux
cp .env.example .env              # fill in ANTHROPIC_API_KEY, PICOVOICE_ACCESS_KEY
python main.py
```

## Wake word status

Porcupine has no built-in "Mahaki" — train the custom keyword at
https://console.picovoice.ai (free), download the `.ppn` for your platform
into `models/`, and set `PORCUPINE_KEYWORD_PATH` in `.env`. Until then the
app falls back to the built-in "porcupine" keyword so the pipeline is
testable end-to-end.

## Adding a tool

1. New module in `agent/tools/` exposing `register(registry)` (see
   `pathway_alignment.py`).
2. Call it from `build_registry()` in `main.py`.
That's it — the orchestrator discovers tools through the registry.

## Rules

- No hardcoded wake words, model names, or paths — everything comes from
  `config.py` / `.env`.
- Keep `agent/` importable without audio deps (pyaudio, whisper, pyttsx3
  are lazy-imported inside `audio/`); tests rely on this.
- `pytest tests/` must pass without a mic, speakers, or API keys.
