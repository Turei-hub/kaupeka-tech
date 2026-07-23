"""Core reasoning loop: transcribed text -> LLM (+ tools) -> response text.

Knows nothing about audio, and nothing about which LLM answers — the provider
lives behind an LLMBackend (see agent/llm.py), chosen by LLM_PROVIDER in .env.
Give the orchestrator text, it returns text. That's what lets the same voice
layer front a different agent later: construct an Orchestrator with a different
registry and system prompt and you're done.
"""

import logging

from agent.llm import AnthropicBackend, LLMBackend, make_backend
from agent.tools_registry import ToolRegistry
from config import AgentConfig

log = logging.getLogger(__name__)


class Orchestrator:
    def __init__(self, cfg: AgentConfig, registry: ToolRegistry,
                 client=None, backend: LLMBackend | None = None):
        self._cfg = cfg
        self._registry = registry
        # Backend resolution order:
        #   explicit backend  ->  legacy Anthropic client (tests)  ->  from cfg
        if backend is not None:
            self._backend = backend
        elif client is not None:
            self._backend = AnthropicBackend(cfg, client=client)
        else:
            self._backend = make_backend(cfg)
        self._history: list[dict] = []   # rolling conversation memory

    async def handle(self, text: str) -> str:
        """One user utterance in, one speakable reply out."""
        if not text.strip():
            return ""

        self._history.append({"role": "user", "content": text})
        self._trim_history()

        reply = await self._backend.respond(
            self._cfg.system_prompt,
            list(self._history),
            self._registry,
            max_tool_rounds=self._cfg.max_tool_rounds,
        )
        self._history.append({"role": "assistant", "content": reply})
        return reply

    def reset(self) -> None:
        """Forget the conversation (e.g. on a 'start over' command)."""
        self._history.clear()

    def _trim_history(self) -> None:
        max_msgs = self._cfg.history_turns
        if len(self._history) > max_msgs:
            del self._history[: len(self._history) - max_msgs]
        # A conversation must start with a user message
        while self._history and self._history[0]["role"] != "user":
            del self._history[0]
