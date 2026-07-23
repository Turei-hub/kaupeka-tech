#!/usr/bin/env python
"""One-shot SAPI5 TTS worker: synthesise a single clip, then exit.

pyttsx3's SAPI5 driver deadlocks in runAndWait() when a single engine is
reused across voices/calls, so train_mahaki.py spawns this worker once per
clip. A fresh process fully releases the SAPI COM object each time.

Usage (invoked by train_mahaki.py, not by hand):
    python tts_worker.py <out_wav> <rate_wpm> <text> [voice_id]
"""
import sys

import pyttsx3


def main() -> int:
    out_wav = sys.argv[1]
    rate = int(sys.argv[2])
    text = sys.argv[3]
    voice_id = sys.argv[4] if len(sys.argv) > 4 else None

    engine = pyttsx3.init()
    if voice_id:
        engine.setProperty("voice", voice_id)
    engine.setProperty("rate", rate)
    engine.save_to_file(text, out_wav)
    engine.runAndWait()
    return 0


if __name__ == "__main__":
    sys.exit(main())
