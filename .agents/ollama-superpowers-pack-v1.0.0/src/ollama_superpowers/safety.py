from __future__ import annotations
import re
from pathlib import Path
from typing import Iterable

class PolicyError(RuntimeError):
    pass

def resolve_inside(workspace: Path, requested: str | Path) -> Path:
    root = workspace.resolve()
    candidate = Path(requested)
    candidate = candidate.resolve() if candidate.is_absolute() else (root / candidate).resolve()
    try:
        candidate.relative_to(root)
    except ValueError as exc:
        raise PolicyError(f"Path escapes workspace: {requested}") from exc
    return candidate

def redact(text: str, patterns: Iterable[str]) -> str:
    out = text
    for pattern in patterns:
        try:
            out = re.sub(pattern, "***REDACTED***", out)
        except re.error:
            continue
    return out

def detect_secrets(text: str, patterns: Iterable[str]) -> bool:
    return any(re.search(pattern, text) for pattern in patterns if _valid(pattern))

def _valid(pattern: str) -> bool:
    try:
        re.compile(pattern); return True
    except re.error:
        return False

def validate_command(argv: list[str], allowed: set[str], denied_fragments: list[str]) -> None:
    if not argv:
        raise PolicyError("Empty command")
    executable = Path(argv[0]).name.lower()
    normalized = {Path(item).name.lower() for item in allowed}
    if executable not in normalized:
        raise PolicyError(f"Command is not allowlisted: {argv[0]}")
    joined = " ".join(argv).lower()
    for fragment in denied_fragments:
        if fragment.lower() in joined:
            raise PolicyError(f"Denied command fragment: {fragment}")
