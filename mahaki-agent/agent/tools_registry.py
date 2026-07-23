"""Tool registry — the swap point for repurposing Mahaki's voice layer.

Tools register themselves with a name, a description Claude reads, a JSON
schema for their inputs, and a handler (sync or async). The orchestrator
never knows about individual tools; it just hands the registry to Claude
and executes whatever Claude calls.

To repoint this core at another agent (e.g. the A.R.E. trading agent),
build a different registry with different tools and pass it to the
Orchestrator — the voice layer and the core loop stay untouched.
"""

import asyncio
import inspect
import json
import logging
from dataclasses import dataclass, field
from typing import Any, Callable

log = logging.getLogger(__name__)


@dataclass(frozen=True)
class Tool:
    name: str
    description: str
    input_schema: dict
    handler: Callable[..., Any]


class ToolRegistry:
    def __init__(self):
        self._tools: dict[str, Tool] = {}

    def register(self, tool: Tool) -> None:
        if tool.name in self._tools:
            raise ValueError(f"Tool {tool.name!r} already registered")
        self._tools[tool.name] = tool
        log.debug("Registered tool %r", tool.name)

    def tool(self, name: str, description: str, input_schema: dict | None = None):
        """Decorator form:

        @registry.tool("pathway_alignment", "Match a client to pathways", schema)
        def pathway_alignment(client_name: str) -> str: ...
        """
        def wrap(fn):
            self.register(Tool(
                name=name,
                description=description,
                input_schema=input_schema or {"type": "object", "properties": {}},
                handler=fn,
            ))
            return fn
        return wrap

    def names(self) -> list[str]:
        return list(self._tools)

    def to_anthropic_tools(self) -> list[dict]:
        """The `tools` parameter for a Claude messages.create call."""
        return [
            {"name": t.name, "description": t.description, "input_schema": t.input_schema}
            for t in self._tools.values()
        ]

    def to_openai_tools(self) -> list[dict]:
        """The `tools` parameter for an OpenAI-compatible chat.completions call.

        Same shape used by Gemini's OpenAI-compatible endpoint — the input
        schema maps straight onto the function's `parameters`.
        """
        return [
            {"type": "function", "function": {
                "name": t.name,
                "description": t.description,
                "parameters": t.input_schema,
            }}
            for t in self._tools.values()
        ]

    async def execute(self, name: str, args: dict) -> str:
        """Run a tool and return its result as a string for the tool_result block.

        Handler errors are captured and returned as text so Claude can tell
        the user what went wrong instead of the whole loop crashing.
        """
        tool = self._tools.get(name)
        if tool is None:
            return f"Error: unknown tool {name!r}"
        try:
            if inspect.iscoroutinefunction(tool.handler):
                result = await tool.handler(**args)
            else:
                # Sync handlers run in an executor so they can't stall the loop
                result = await asyncio.get_running_loop().run_in_executor(
                    None, lambda: tool.handler(**args)
                )
        except Exception as exc:
            log.exception("Tool %r failed", name)
            return f"Error running {name}: {exc}"
        if isinstance(result, str):
            return result
        return json.dumps(result, default=str)
