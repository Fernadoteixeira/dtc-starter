from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class TaskHints:
    requires_schema: bool=False
    requires_vision: bool=False
    requires_embeddings: bool=False
    local_only: bool=False
    secrets_detected: bool=False
    estimated_input_tokens: int=0
    task_class: str="general"

@dataclass(frozen=True)
class RouteDecision:
    profile: str
    model: str
    reason: str

def choose_model(h: TaskHints, local_model: str, cloud_model: str, vision_model: str, embed_model: str) -> RouteDecision:
    if h.requires_vision: return RouteDecision("vision",vision_model,"Vision requires an optional multimodal model.")
    if h.requires_embeddings: return RouteDecision("embeddings",embed_model,"Embeddings require a dedicated model.")
    if h.requires_schema: return RouteDecision("local-structured",local_model,"Strict schemas route locally.")
    if h.local_only or h.secrets_detected: return RouteDecision("local-private",local_model,"Privacy or secret boundary.")
    if h.estimated_input_tokens >= 60000: return RouteDecision("cloud-long-context",cloud_model,"Evidence exceeds local soft budget.")
    if h.task_class in {"architecture","cross-repo","long-debug","release-arbitration"}:
        return RouteDecision("cloud-deep",cloud_model,"Task benefits from long-horizon reasoning.")
    return RouteDecision("local-default",local_model,"Local execution is the cheapest capable route.")
