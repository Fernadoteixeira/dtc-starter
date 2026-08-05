from __future__ import annotations
import json, os, time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


@dataclass
class ProviderRequest:
    call_id: str
    task_id: str
    step: int
    model: str
    purpose: str
    started_at: str
    finished_at: str
    duration_ms: float
    success: bool
    retry: bool
    input_estimate: int
    output_estimate: int
    tools_exposed: int
    redaction_status: str


@dataclass
class UsageTracker:
    """Tracks real provider HTTP requests, not just logical cloud calls.

    The Ollama provider counts every client.chat() invocation as a request.
    The agent loop may issue many such requests per single "logical cloud call".
    This tracker reconciles logical calls with physical provider requests.
    """
    task_id: str
    max_provider_requests: int = 25
    max_agent_steps_cloud: int = 4
    max_cloud_retries: int = 0
    max_session_usage_delta_pp: float = 5.0
    ledger_path: Path | None = None
    requests: list[ProviderRequest] = field(default_factory=list)
    _request_counter: int = 0
    _blocked: bool = False
    _block_reason: str = ""

    def begin_request(self, model: str, step: int, purpose: str,
                      input_estimate: int = 0, tools_exposed: int = 0) -> str:
        if self._blocked:
            raise UsageBlocked(self._block_reason)
        if len(self.requests) >= self.max_provider_requests:
            self._blocked = True
            self._block_reason = (
                f"Provider request limit reached: {self.max_provider_requests}"
            )
            self._flush()
            raise UsageBlocked(self._block_reason)
        self._request_counter += 1
        call_id = f"req-{self.task_id}-{self._request_counter:04d}"
        return call_id

    def end_request(self, call_id: str, model: str, step: int, purpose: str,
                    started_at: str, finished_at: str, duration_ms: float,
                    success: bool, retry: bool = False,
                    input_estimate: int = 0, output_estimate: int = 0,
                    tools_exposed: int = 0, redaction_status: str = "clean") -> None:
        req = ProviderRequest(
            call_id=call_id, task_id=self.task_id, step=step, model=model,
            purpose=purpose, started_at=started_at, finished_at=finished_at,
            duration_ms=duration_ms, success=success, retry=retry,
            input_estimate=input_estimate, output_estimate=output_estimate,
            tools_exposed=tools_exposed, redaction_status=redaction_status,
        )
        self.requests.append(req)
        self._flush()

    @property
    def provider_request_count(self) -> int:
        return len(self.requests)

    @property
    def cloud_request_count(self) -> int:
        return sum(1 for r in self.requests if "cloud" in r.model or "glm" in r.model)

    @property
    def local_request_count(self) -> int:
        return sum(1 for r in self.requests if "cloud" not in r.model and "glm" not in r.model)

    @property
    def retry_count(self) -> int:
        return sum(1 for r in self.requests if r.retry)

    @property
    def total_duration_ms(self) -> float:
        return sum(r.duration_ms for r in self.requests)

    @property
    def total_input_estimate(self) -> int:
        return sum(r.input_estimate for r in self.requests)

    @property
    def total_output_estimate(self) -> int:
        return sum(r.output_estimate for r in self.requests)

    @property
    def is_blocked(self) -> bool:
        return self._blocked

    @property
    def block_reason(self) -> str:
        return self._block_reason

    def efficiency_report(self) -> dict[str, Any]:
        completed = sum(1 for r in self.requests if r.success)
        return {
            "task_id": self.task_id,
            "provider_requests_total": self.provider_request_count,
            "cloud_requests": self.cloud_request_count,
            "local_requests": self.local_request_count,
            "retries": self.retry_count,
            "completed_successfully": completed,
            "provider_requests_per_completed_task": (
                self.provider_request_count / completed if completed > 0 else None
            ),
            "total_duration_ms": round(self.total_duration_ms, 1),
            "total_input_estimate": self.total_input_estimate,
            "total_output_estimate": self.total_output_estimate,
            "local_to_cloud_ratio": (
                f"{self.local_request_count}:{self.cloud_request_count}"
                if self.cloud_request_count > 0 else f"{self.local_request_count}:0"
            ),
            "blocked": self._blocked,
            "block_reason": self._block_reason,
            "max_provider_requests": self.max_provider_requests,
            "max_agent_steps_cloud": self.max_agent_steps_cloud,
            "max_cloud_retries": self.max_cloud_retries,
            "within_budget": self.provider_request_count <= self.max_provider_requests,
        }

    def _flush(self) -> None:
        if self.ledger_path is None:
            return
        self.ledger_path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "task_id": self.task_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "requests": [
                {
                    "call_id": r.call_id, "task_id": r.task_id, "step": r.step,
                    "model": r.model, "purpose": r.purpose,
                    "started_at": r.started_at, "finished_at": r.finished_at,
                    "duration_ms": r.duration_ms, "success": r.success,
                    "retry": r.retry, "input_estimate": r.input_estimate,
                    "output_estimate": r.output_estimate,
                    "tools_exposed": r.tools_exposed,
                    "redaction_status": r.redaction_status,
                }
                for r in self.requests
            ],
            "summary": self.efficiency_report(),
        }
        self.ledger_path.write_text(
            json.dumps(data, indent=2, ensure_ascii=False, default=str),
            encoding="utf-8",
        )


class UsageBlocked(Exception):
    """Raised when provider request budget is exhausted."""
    pass