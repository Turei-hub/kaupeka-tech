"""Pathway alignment tool — first registered tool (stub).

Matches a client's needs against Kaupeka Digital's delivery pathways. The
dataset below is a placeholder; wire it to the real pathway/client source
(spreadsheet, CRM, database) when that's decided. The tool's interface —
name, description, schema — is what Claude sees, so keep those accurate
as the implementation grows.
"""

from agent.tools_registry import ToolRegistry

# Placeholder pathway catalogue until the real data source is wired in.
PATHWAYS = {
    "digital_foundations": {
        "label": "Digital Foundations",
        "keywords": ["website", "online", "presence", "email", "domain", "starting"],
        "summary": "Entry pathway: web presence, email, and core digital setup.",
    },
    "systems_integration": {
        "label": "Systems Integration",
        "keywords": ["automation", "integrate", "workflow", "crm", "process", "data"],
        "summary": "Connecting and automating existing business systems.",
    },
    "ai_enablement": {
        "label": "AI Enablement",
        "keywords": ["ai", "agent", "assistant", "chatbot", "machine learning", "automation"],
        "summary": "Applied AI: assistants, agents, and intelligent tooling.",
    },
}


def pathway_alignment(client_name: str, needs: str) -> dict:
    """Score each pathway against the described needs and return ranked matches."""
    needs_lower = needs.lower()
    scored = []
    for key, p in PATHWAYS.items():
        hits = [kw for kw in p["keywords"] if kw in needs_lower]
        if hits:
            scored.append({
                "pathway": p["label"],
                "score": len(hits),
                "matched_on": hits,
                "summary": p["summary"],
            })
    scored.sort(key=lambda s: s["score"], reverse=True)
    return {
        "client": client_name,
        "matches": scored or [{"pathway": None, "note": "No pathway matched — needs a human look."}],
    }


def register(registry: ToolRegistry) -> None:
    registry.tool(
        name="pathway_alignment",
        description=(
            "Match a client to Kaupeka Digital delivery pathways based on a plain-language "
            "description of their needs. Use whenever Turei asks which pathway fits a "
            "client or how to align a client's request with what Kaupeka offers."
        ),
        input_schema={
            "type": "object",
            "properties": {
                "client_name": {"type": "string", "description": "The client's name"},
                "needs": {
                    "type": "string",
                    "description": "Plain-language description of what the client needs",
                },
            },
            "required": ["client_name", "needs"],
        },
    )(pathway_alignment)
