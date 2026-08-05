from __future__ import annotations
from dataclasses import dataclass
from typing import Iterable

@dataclass(frozen=True)
class EvidencePacket:
    source: str
    content: str
    priority: int=50

def estimate_tokens(text: str) -> int:
    return max(1,len(text)//3)

def pack_evidence(packets: Iterable[EvidencePacket], soft_budget_tokens: int) -> tuple[str,list[str]]:
    accepted=[]; rejected=[]; used=0
    for p in sorted(packets,key=lambda x:(-x.priority,x.source)):
        block=f"\n\n### SOURCE: {p.source}\n{p.content.strip()}"
        cost=estimate_tokens(block)
        if used+cost <= soft_budget_tokens:
            accepted.append(block); used += cost
        else:
            rejected.append(p.source)
    return "".join(accepted).strip(), rejected
