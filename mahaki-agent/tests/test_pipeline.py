"""Pipeline tests — run without a mic, speakers, audio deps, or API keys.

The Claude client is mocked with canned responses (including tool_use turns)
so the orchestrator's full tool loop is exercised offline.
"""

import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from agent.orchestrator import Orchestrator
from agent.tools import pathway_alignment
from agent.tools_registry import Tool, ToolRegistry
from config import AgentConfig, load_config


# -- helpers -----------------------------------------------------------


def text_block(text):
    return SimpleNamespace(type="text", text=text)


def tool_use_block(id, name, input):
    return SimpleNamespace(type="tool_use", id=id, name=name, input=input)


class FakeClaude:
    """Stands in for AsyncAnthropic; pops canned responses in order."""

    def __init__(self, responses):
        self._responses = list(responses)
        self.calls = []
        self.messages = SimpleNamespace(create=self._create)

    async def _create(self, **kwargs):
        self.calls.append(kwargs)
        return self._responses.pop(0)


def make_orchestrator(responses, registry=None, **cfg_overrides):
    cfg = AgentConfig(anthropic_api_key="test-key", **cfg_overrides)
    return Orchestrator(cfg, registry or ToolRegistry(), client=FakeClaude(responses))


# -- config ------------------------------------------------------------


def test_config_loads_with_defaults():
    cfg = load_config()
    assert cfg.wake_word == "Mahaki"
    assert cfg.audio.sample_rate == 16_000
    assert cfg.agent.max_tool_rounds >= 1


# -- registry ----------------------------------------------------------


def test_registry_register_and_export():
    registry = ToolRegistry()

    @registry.tool("greet", "Say hello", {"type": "object", "properties": {}})
    def greet():
        return "hello"

    assert registry.names() == ["greet"]
    exported = registry.to_anthropic_tools()
    assert exported == [
        {"name": "greet", "description": "Say hello",
         "input_schema": {"type": "object", "properties": {}}}
    ]


def test_registry_rejects_duplicate_names():
    registry = ToolRegistry()
    registry.register(Tool("t", "d", {}, lambda: None))
    with pytest.raises(ValueError):
        registry.register(Tool("t", "d", {}, lambda: None))


@pytest.mark.asyncio
async def test_registry_executes_sync_and_async_handlers():
    registry = ToolRegistry()

    @registry.tool("sync_tool", "sync")
    def sync_tool(x):
        return {"got": x}

    @registry.tool("async_tool", "async")
    async def async_tool(x):
        return f"async:{x}"

    assert await registry.execute("sync_tool", {"x": 1}) == '{"got": 1}'
    assert await registry.execute("async_tool", {"x": "y"}) == "async:y"


@pytest.mark.asyncio
async def test_registry_reports_unknown_tool_and_handler_errors_as_text():
    registry = ToolRegistry()

    @registry.tool("boom", "explodes")
    def boom():
        raise RuntimeError("kaboom")

    assert "unknown tool" in await registry.execute("nope", {})
    result = await registry.execute("boom", {})
    assert "kaboom" in result  # error surfaced to Claude, loop didn't crash


# -- orchestrator ------------------------------------------------------


@pytest.mark.asyncio
async def test_plain_answer_no_tools():
    orch = make_orchestrator([
        SimpleNamespace(stop_reason="end_turn", content=[text_block("Kia ora!")]),
    ])
    assert await orch.handle("hello") == "Kia ora!"


@pytest.mark.asyncio
async def test_tool_use_round_trip():
    registry = ToolRegistry()
    pathway_alignment.register(registry)

    fake = FakeClaude([
        SimpleNamespace(stop_reason="tool_use", content=[
            tool_use_block("tu_1", "pathway_alignment",
                           {"client_name": "Ngāti Whātua", "needs": "a website and email"}),
        ]),
        SimpleNamespace(stop_reason="end_turn",
                        content=[text_block("Digital Foundations fits best.")]),
    ])
    orch = Orchestrator(AgentConfig(anthropic_api_key="k"), registry, client=fake)

    reply = await orch.handle("Which pathway for Ngāti Whātua? They need a website.")
    assert reply == "Digital Foundations fits best."

    # Second API call must carry the tool_result for Claude's tool_use id
    followup = fake.calls[1]["messages"]
    tool_result = followup[-1]["content"][0]
    assert tool_result["type"] == "tool_result"
    assert tool_result["tool_use_id"] == "tu_1"
    assert "Digital Foundations" in tool_result["content"]


@pytest.mark.asyncio
async def test_tool_loop_is_capped():
    endless_tool_use = SimpleNamespace(stop_reason="tool_use", content=[
        tool_use_block("tu_x", "missing_tool", {}),
    ])
    orch = make_orchestrator([endless_tool_use] * 3, max_tool_rounds=3)
    reply = await orch.handle("loop forever")
    assert reply  # falls back to an apology instead of hanging


@pytest.mark.asyncio
async def test_history_carries_between_turns_and_is_trimmed():
    responses = [
        SimpleNamespace(stop_reason="end_turn", content=[text_block(f"r{i}")])
        for i in range(10)
    ]
    orch = make_orchestrator(responses, history_turns=4)
    for i in range(10):
        await orch.handle(f"q{i}")

    history = orch._history
    assert len(history) <= 4
    assert history[0]["role"] == "user"
    # Most recent exchange is intact
    assert history[-2:] == [{"role": "user", "content": "q9"},
                            {"role": "assistant", "content": "r9"}]


@pytest.mark.asyncio
async def test_empty_utterance_short_circuits():
    orch = make_orchestrator([])  # no canned responses: API must not be called
    assert await orch.handle("   ") == ""


# -- OpenAI-compatible backend (the Gemini path) -----------------------


def oai_response(content=None, tool_calls=None):
    message = SimpleNamespace(content=content, tool_calls=tool_calls)
    return SimpleNamespace(choices=[SimpleNamespace(message=message)])


def oai_tool_call(id, name, arguments):
    return SimpleNamespace(id=id, type="function",
                           function=SimpleNamespace(name=name, arguments=arguments))


class FakeOpenAI:
    """Stands in for AsyncOpenAI; pops canned chat.completions in order."""

    def __init__(self, responses):
        self._responses = list(responses)
        self.calls = []
        self.chat = SimpleNamespace(
            completions=SimpleNamespace(create=self._create))

    async def _create(self, **kwargs):
        self.calls.append(kwargs)
        return self._responses.pop(0)


def make_openai_orchestrator(responses, registry=None):
    from agent.llm import OpenAIBackend
    backend = OpenAIBackend(AgentConfig(), api_key="k", base_url="http://x",
                            model="gemini-2.5-flash", client=FakeOpenAI(responses))
    orch = Orchestrator(AgentConfig(), registry or ToolRegistry(), backend=backend)
    return orch, backend._client


@pytest.mark.asyncio
async def test_openai_backend_plain_answer():
    orch, client = make_openai_orchestrator([oai_response(content="Kia ora from Gemini")])
    assert await orch.handle("hello") == "Kia ora from Gemini"
    # System prompt is injected as the first message for OpenAI-style APIs
    assert client.calls[0]["messages"][0]["role"] == "system"


@pytest.mark.asyncio
async def test_openai_backend_tool_round_trip():
    registry = ToolRegistry()
    pathway_alignment.register(registry)

    orch, client = make_openai_orchestrator([
        oai_response(tool_calls=[oai_tool_call(
            "call_1", "pathway_alignment",
            '{"client_name": "Ngāti Whātua", "needs": "a website and email"}')]),
        oai_response(content="Digital Foundations fits best."),
    ], registry)

    reply = await orch.handle("Which pathway for Ngāti Whātua? They need a website.")
    assert reply == "Digital Foundations fits best."

    # Second call must carry the tool result as a role="tool" message keyed by id
    followup = client.calls[1]["messages"]
    tool_msgs = [m for m in followup if m.get("role") == "tool"]
    assert tool_msgs and tool_msgs[0]["tool_call_id"] == "call_1"
    assert "Digital Foundations" in tool_msgs[0]["content"]


def test_registry_openai_tool_format():
    registry = ToolRegistry()

    @registry.tool("greet", "Say hello", {"type": "object", "properties": {}})
    def greet():
        return "hello"

    assert registry.to_openai_tools() == [
        {"type": "function", "function": {
            "name": "greet", "description": "Say hello",
            "parameters": {"type": "object", "properties": {}}}}
    ]


def test_make_backend_selects_provider():
    from agent.llm import make_backend, AnthropicBackend, OpenAIBackend
    assert isinstance(
        make_backend(AgentConfig(provider="anthropic", anthropic_api_key="k")),
        AnthropicBackend)
    assert isinstance(
        make_backend(AgentConfig(provider="gemini", gemini_api_key="k")),
        OpenAIBackend)
    with pytest.raises(ValueError):
        make_backend(AgentConfig(provider="bogus"))


# -- pathway alignment tool --------------------------------------------


def test_pathway_alignment_ranks_matches():
    result = pathway_alignment.pathway_alignment(
        "Tūhoe Digital", "they want AI agents and workflow automation"
    )
    labels = [m["pathway"] for m in result["matches"]]
    assert "AI Enablement" in labels
    assert "Systems Integration" in labels


def test_pathway_alignment_handles_no_match():
    result = pathway_alignment.pathway_alignment("X", "completely unrelated needs")
    assert result["matches"][0]["pathway"] is None


# -- decoupling guarantee ----------------------------------------------


def test_agent_layer_imports_without_audio_deps():
    """The agent layer must never require pyaudio/whisper/pyttsx3."""
    for mod in ("pyaudio", "pvporcupine", "faster_whisper", "pyttsx3"):
        assert mod not in sys.modules, f"{mod} leaked into the agent import graph"
