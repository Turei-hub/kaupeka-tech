"""Core reasoning loop: transcribed text -> Claude (+ tools) -> response text.

Knows nothing about audio. Give it text, it returns text — which is exactly
what lets the same voice layer front a different agent later: construct an
Orchestrator with a different registry and system prompt and you're done.
"""

import logging

from anthropic import AsyncAnthropic

from agent.tools_registry import ToolRegistry
from config import AgentConfig

log = logging.getLogger(__name__)


class Orchestrator:
    def __init__(self, cfg: AgentConfig, registry: ToolRegistry, client: AsyncAnthropic | None = None):
        self._cfg = cfg
        self._registry = registry
        # Injectable for tests; defaults to a real client using the .env key.
        self._client = client or AsyncAnthropic(api_key=cfg.anthropic_api_key)
        self._history: list[dict] = []   # rolling conversation memory

    async def handle(self, text: str) -> str:
        """One user utterance in, one speakable reply out."""
        if not text.strip():
            return ""

        self._history.append({"role": "user", "content": text})
        self._trim_history()
        messages = list(self._history)
        tools = self._registry.to_anthropic_tools()

        for _ in range(self._cfg.max_tool_rounds):
            response = await self._client.messages.create(
                model=self._cfg.model,
                max_tokens=self._cfg.max_tokens,
                system=self._cfg.system_prompt,
                tools=tools,
                messages=messages,
            )

            if response.stop_reason != "tool_use":
                reply = _text_of(response)
                self._history.append({"role": "assistant", "content": reply})
                return reply

            # Claude wants tools: echo its turn back, run each call, continue.
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []
            for block in response.content:
                if block.type != "tool_use":
                    continue
                log.info("Tool call: %s(%s)", block.name, block.input)
                result = await self._registry.execute(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })
            messages.append({"role": "user", "content": tool_results})

        log.warning("Hit max_tool_rounds (%d) without a final answer", self._cfg.max_tool_rounds)
        reply = "Sorry, that took too many steps — try asking a simpler way."
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


def _text_of(response) -> str:
    return " ".join(b.text for b in response.content if b.type == "text").strip()
