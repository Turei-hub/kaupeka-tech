"""LLM backends for the orchestrator.

One interface, two implementations, so Mahaki can run on either Anthropic
(Claude) or any OpenAI-compatible endpoint — including Google Gemini via its
OpenAI-compatible URL. The provider is chosen with LLM_PROVIDER in .env; the
audio layer and the tool registry never change.

Each backend runs its own tool-use loop (the wire formats differ too much to
share one) but they agree on the contract: given a system prompt, the rolling
neutral history (a list of {"role": "user"|"assistant", "content": str}), and
the ToolRegistry, return one final speakable string.
"""

import json
import logging
from typing import Protocol

from agent.tools_registry import ToolRegistry
from config import AgentConfig

log = logging.getLogger(__name__)

# Google's OpenAI-compatible endpoint for the Gemini API (AI Studio keys).
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

DEFAULT_MODELS = {
    "anthropic": "claude-opus-4-8",
    "gemini": "gemini-2.5-flash",
    "google": "gemini-2.5-flash",
    "openai": "gpt-4o-mini",
}

_TOO_MANY_STEPS = "Sorry, that took too many steps — try asking a simpler way."


class LLMBackend(Protocol):
    async def respond(self, system: str, history: list[dict],
                      registry: ToolRegistry, *, max_tool_rounds: int) -> str:
        ...


# -- Anthropic (Claude) ------------------------------------------------------


class AnthropicBackend:
    """Claude via the Anthropic Messages API and its native tool-use format."""

    def __init__(self, cfg: AgentConfig, client=None):
        self._cfg = cfg
        self._model = cfg.model or DEFAULT_MODELS["anthropic"]
        if client is not None:
            self._client = client
        else:
            from anthropic import AsyncAnthropic
            self._client = AsyncAnthropic(api_key=cfg.anthropic_api_key)

    async def respond(self, system, history, registry, *, max_tool_rounds):
        messages = list(history)
        tools = registry.to_anthropic_tools()

        for _ in range(max_tool_rounds):
            resp = await self._client.messages.create(
                model=self._model,
                max_tokens=self._cfg.max_tokens,
                system=system,
                tools=tools,
                messages=messages,
            )
            if resp.stop_reason != "tool_use":
                return _anthropic_text(resp)

            # Claude wants tools: echo its turn back, run each call, continue.
            messages.append({"role": "assistant", "content": resp.content})
            tool_results = []
            for block in resp.content:
                if block.type != "tool_use":
                    continue
                log.info("Tool call: %s(%s)", block.name, block.input)
                result = await registry.execute(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result,
                })
            messages.append({"role": "user", "content": tool_results})

        log.warning("Hit max_tool_rounds (%d) without a final answer", max_tool_rounds)
        return _TOO_MANY_STEPS


def _anthropic_text(resp) -> str:
    return " ".join(b.text for b in resp.content if b.type == "text").strip()


# -- OpenAI-compatible (Gemini / OpenAI / others) ---------------------------


class OpenAIBackend:
    """chat.completions backend for any OpenAI-compatible API.

    Used for Gemini (via GEMINI_BASE_URL) and for OpenAI itself. The tool loop
    follows the OpenAI function-calling convention: assistant messages carry
    `tool_calls`, and each result comes back as a `role="tool"` message keyed
    by `tool_call_id`.
    """

    def __init__(self, cfg: AgentConfig, *, api_key: str, base_url: str | None,
                 model: str, client=None):
        self._cfg = cfg
        self._model = model
        if client is not None:
            self._client = client
        else:
            from openai import AsyncOpenAI
            self._client = AsyncOpenAI(api_key=api_key, base_url=base_url)

    async def respond(self, system, history, registry, *, max_tool_rounds):
        messages = [{"role": "system", "content": system}]
        messages += [{"role": m["role"], "content": m["content"]} for m in history]
        tools = registry.to_openai_tools() or None

        for _ in range(max_tool_rounds):
            resp = await self._client.chat.completions.create(
                model=self._model,
                max_tokens=self._cfg.max_tokens,
                messages=messages,
                tools=tools,
            )
            msg = resp.choices[0].message
            if not getattr(msg, "tool_calls", None):
                return (msg.content or "").strip()

            # Echo the assistant's tool-call turn, then run each call.
            messages.append({
                "role": "assistant",
                "content": msg.content or "",
                "tool_calls": [
                    {"id": tc.id, "type": "function",
                     "function": {"name": tc.function.name,
                                  "arguments": tc.function.arguments}}
                    for tc in msg.tool_calls
                ],
            })
            for tc in msg.tool_calls:
                try:
                    args = json.loads(tc.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = {}
                log.info("Tool call: %s(%s)", tc.function.name, args)
                result = await registry.execute(tc.function.name, args)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result,
                })

        log.warning("Hit max_tool_rounds (%d) without a final answer", max_tool_rounds)
        return _TOO_MANY_STEPS


# -- selection ---------------------------------------------------------------


def make_backend(cfg: AgentConfig) -> LLMBackend:
    """Build the backend named by cfg.provider (LLM_PROVIDER in .env)."""
    provider = cfg.provider
    if provider == "anthropic":
        return AnthropicBackend(cfg)
    if provider in ("gemini", "google"):
        return OpenAIBackend(cfg, api_key=cfg.gemini_api_key,
                             base_url=GEMINI_BASE_URL,
                             model=cfg.model or DEFAULT_MODELS["gemini"])
    if provider == "openai":
        return OpenAIBackend(cfg, api_key=cfg.openai_api_key, base_url=None,
                             model=cfg.model or DEFAULT_MODELS["openai"])
    raise ValueError(
        f"Unknown LLM provider {provider!r}. Set LLM_PROVIDER to "
        f"'gemini', 'anthropic', or 'openai'."
    )
