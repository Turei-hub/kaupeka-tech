# Mahaki — Local Voice Agent

Voice-first local AI agent for Turei Milner (Kaupeka Digital Ltd). Wake word
"Mahaki" → local Whisper STT → LLM + tools → offline TTS reply. No cloud
STT/TTS costs. The reasoning layer is pluggable (`LLM_PROVIDER` in `.env`):
Gemini (free tier, default), Anthropic (paid), or any OpenAI-compatible API.
Backends live in `agent/llm.py`; the audio layer and tools never change.

Not based on the LAE Engine — separate architecture, separate purpose.

## Architecture

Two decoupled layers, on purpose:

- **Speech I/O** (`audio/`): wake word (openWakeWord, background thread) →
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
cp .env.example .env              # fill in ANTHROPIC_API_KEY (no other keys needed)
python main.py
```

## Wake word status

openWakeWord has no pretrained "Mahaki" model — train one via the
[openWakeWord training notebook](https://github.com/dscripka/openWakeWord#training-new-models)
(free, no account), export the `.onnx` file into `models/`, and set
`OWW_MODEL_PATH` in `.env`. Until then the app falls back to the bundled
"hey_jarvis" model so the pipeline is testable end-to-end. No API key or
vendor account is needed at any point.

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
