from __future__ import annotations
import json, time
from dataclasses import dataclass
from datetime import datetime, timezone
from .audit import AuditLedger
from .registry import ToolRegistry
from .safety import redact
from .usage_tracker import UsageTracker, UsageBlocked

@dataclass
class AgentResult:
    content: str
    model: str
    steps: int
    stop_reason: str
    provider_requests: int = 0
    usage_report: dict | None = None

class AgentLoop:
    def __init__(self,host,model,think,registry:ToolRegistry,ledger:AuditLedger,redaction_patterns,
                 max_steps=12,include_write=False,include_shell=True,include_web=False,
                 usage_tracker:UsageTracker|None=None):
        self.host=host; self.model=model; self.think=think; self.registry=registry; self.ledger=ledger
        self.redaction_patterns=redaction_patterns; self.max_steps=max_steps
        self.schemas=registry.schemas(include_write,include_shell,include_web)
        self.seen_signatures={}
        self.usage_tracker=usage_tracker or UsageTracker(task_id="default")
        self.is_cloud="glm" in self.model or "cloud" in self.model
        # Hard cap: cloud models get fewer steps regardless of --max-steps
        if self.is_cloud and self.usage_tracker.max_agent_steps_cloud>0:
            self.max_steps=min(self.max_steps,self.usage_tracker.max_agent_steps_cloud)

    def run(self,system_prompt,task):
        from ollama import Client
        client=Client(host=self.host)
        messages=[{"role":"system","content":system_prompt},{"role":"user","content":task}]
        self.ledger.record("agent_start",{"model":self.model,"max_steps":self.max_steps,
            "effective_max_steps":self.max_steps,
            "cloud_hard_cap_applied":self.is_cloud and self.usage_tracker.max_agent_steps_cloud>0,
            "usage_tracker_enabled":True,"max_provider_requests":self.usage_tracker.max_provider_requests})
        for step in range(1,self.max_steps+1):
            # Count every client.chat() as a real provider request
            req_started=datetime.now(timezone.utc).isoformat()
            t0=time.monotonic()
            call_id=self.usage_tracker.begin_request(
                model=self.model,step=step,purpose=f"agent_step_{step}")
            try:
                resp=client.chat(model=self.model,messages=messages,tools=self.schemas,think=self.think,stream=False)
                success=True
            except Exception as e:
                success=False
                req_finished=datetime.now(timezone.utc).isoformat()
                dur_ms=(time.monotonic()-t0)*1000
                self.usage_tracker.end_request(
                    call_id=call_id,model=self.model,step=step,purpose=f"agent_step_{step}",
                    started_at=req_started,finished_at=req_finished,duration_ms=dur_ms,
                    success=success,retry=False,tools_exposed=len(self.schemas))
                self.ledger.record("provider_request",{"call_id":call_id,"step":step,
                    "model":self.model,"success":False,"error":str(e)[:500]})
                raise
            req_finished=datetime.now(timezone.utc).isoformat()
            dur_ms=(time.monotonic()-t0)*1000
            msg=resp.message
            payload=msg.model_dump(exclude_none=True) if hasattr(msg,"model_dump") else dict(msg)
            messages.append(payload)
            calls=getattr(msg,"tool_calls",None) or []
            content=getattr(msg,"content","") or ""
            input_est=len(system_prompt)+len(task)+sum(len(str(m.get("content",""))) for m in messages[:-1])
            output_est=len(content)
            self.usage_tracker.end_request(
                call_id=call_id,model=self.model,step=step,purpose=f"agent_step_{step}",
                started_at=req_started,finished_at=req_finished,duration_ms=dur_ms,
                success=success,retry=False,input_estimate=input_est,
                output_estimate=output_est,tools_exposed=len(self.schemas))
            self.ledger.record("provider_request",{"call_id":call_id,"step":step,
                "model":self.model,"success":True,"duration_ms":round(dur_ms,1),
                "input_estimate":input_est,"output_estimate":output_est,
                "tool_calls":len(calls)})
            self.ledger.record("model_step",{"step":step,"tool_calls":len(calls),
                "content_preview":redact(content[:1000],self.redaction_patterns),
                "provider_request_count":self.usage_tracker.provider_request_count})
            if not calls:
                report=self.usage_tracker.efficiency_report()
                return AgentResult(content,self.model,step,"completed",
                    provider_requests=self.usage_tracker.provider_request_count,
                    usage_report=report)
            for call in calls:
                name=call.function.name; args=call.function.arguments or {}
                sig=name+":"+json.dumps(args,sort_keys=True,default=str)
                self.seen_signatures[sig]=self.seen_signatures.get(sig,0)+1
                if self.seen_signatures[sig]>2:
                    result={"error":"loop_guard","message":"Repeated unchanged tool call blocked"}
                else:
                    try: result=self.registry.execute(name,args)
                    except Exception as e: result={"error":type(e).__name__,"message":str(e)}
                serialized=json.dumps(result,ensure_ascii=False,default=str)
                self.ledger.record("tool",{"step":step,"name":name,
                    "arguments":redact(json.dumps(args,ensure_ascii=False),self.redaction_patterns),
                    "result_preview":redact(serialized[:3000],self.redaction_patterns)})
                messages.append({"role":"tool","tool_name":name,"content":serialized[:50000]})
        report=self.usage_tracker.efficiency_report()
        return AgentResult("Agent stopped at the configured step limit.",self.model,self.max_steps,"max_steps",
            provider_requests=self.usage_tracker.provider_request_count,
            usage_report=report)
