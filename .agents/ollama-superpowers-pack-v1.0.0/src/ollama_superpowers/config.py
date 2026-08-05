from __future__ import annotations
import json, os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

def load_json(path: str | Path) -> dict[str, Any]:
    return json.loads(Path(path).read_text(encoding="utf-8"))

def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    return default if value is None else value.strip().lower() in {"1","true","yes","on"}

@dataclass(frozen=True)
class RuntimeSettings:
    host: str
    local_model: str
    cloud_model: str
    embed_model: str
    vision_model: str
    write_enabled: bool
    shell_enabled: bool
    allow_cloud_with_secrets: bool
    max_steps: int
    audit_dir: str

    @classmethod
    def from_env(cls) -> "RuntimeSettings":
        return cls(
            host=os.getenv("OLLAMA_HOST","http://localhost:11434"),
            local_model=os.getenv("OLLAMA_LOCAL_MODEL","gpt-oss:20b"),
            cloud_model=os.getenv("OLLAMA_CLOUD_MODEL","glm-5.2:cloud"),
            embed_model=os.getenv("OLLAMA_EMBED_MODEL","embeddinggemma"),
            vision_model=os.getenv("OLLAMA_VISION_MODEL","gemma4"),
            write_enabled=env_bool("OLLAMA_SUPERPOWERS_WRITE_ENABLED",False),
            shell_enabled=env_bool("OLLAMA_SUPERPOWERS_SHELL_ENABLED",True),
            allow_cloud_with_secrets=env_bool("OLLAMA_SUPERPOWERS_ALLOW_CLOUD_WITH_SECRETS",False),
            max_steps=int(os.getenv("OLLAMA_SUPERPOWERS_MAX_TOOL_STEPS","12")),
            audit_dir=os.getenv("OLLAMA_SUPERPOWERS_AUDIT_DIR",".audit"),
        )
