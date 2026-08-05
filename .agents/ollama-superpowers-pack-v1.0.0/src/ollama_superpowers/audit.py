from __future__ import annotations
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

class AuditLedger:
    def __init__(self, directory: Path, enabled: bool = True):
        self.enabled = enabled
        self.directory = directory
        if enabled: directory.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        self.path = directory / f"run-{stamp}.jsonl"

    def record(self, event: str, payload: dict[str, Any]) -> None:
        if not self.enabled: return
        row = {"timestamp":datetime.now(timezone.utc).isoformat(),"event":event,"payload":payload}
        with self.path.open("a",encoding="utf-8") as f:
            f.write(json.dumps(row,ensure_ascii=False,default=str)+"\n")
