from __future__ import annotations
import argparse, json
from pathlib import Path
from .agent_loop import AgentLoop
from .audit import AuditLedger
from .config import RuntimeSettings
from .registry import ToolRegistry
from .router import TaskHints, choose_model
from .safety import detect_secrets
from .tools import ToolRuntime
from .usage_tracker import UsageTracker

def args():
    p=argparse.ArgumentParser(description="Run a governed Ollama agent")
    p.add_argument("--task",required=True); p.add_argument("--agent",default="orchestrator")
    p.add_argument("--locale",default="pt-BR",choices=["pt-BR","en","es","fr"])
    p.add_argument("--workspace",default="."); p.add_argument("--pack-root",default=str(Path(__file__).resolve().parents[2]))
    p.add_argument("--model"); p.add_argument("--task-class",default="general")
    p.add_argument("--estimated-input-tokens",type=int,default=0)
    p.add_argument("--schema",action="store_true"); p.add_argument("--vision",action="store_true")
    p.add_argument("--embeddings",action="store_true"); p.add_argument("--local-only",action="store_true")
    p.add_argument("--web",action="store_true"); p.add_argument("--write",action="store_true")
    p.add_argument("--no-shell",action="store_true"); p.add_argument("--max-steps",type=int)
    return p.parse_args()

def main():
    a=args(); s=RuntimeSettings.from_env(); root=Path(a.pack_root).resolve(); ws=Path(a.workspace).resolve()
    policy=json.loads((root/"config/policies/default.json").read_text(encoding="utf-8"))
    if a.write and s.write_enabled: policy["allow_write"]=True
    secrets=detect_secrets(a.task,policy.get("redact_patterns",[]))
    hints=TaskHints(a.schema,a.vision,a.embeddings,a.local_only,secrets,a.estimated_input_tokens,a.task_class)
    d=choose_model(hints,s.local_model,s.cloud_model,s.vision_model,s.embed_model)
    model=a.model or d.model
    if model.startswith("glm-5.2") and secrets and not s.allow_cloud_with_secrets:
        model=s.local_model; d=type(d)("local-secret-override",model,"Secret detector forced local execution.")
    think="medium" if model.startswith("gpt-oss") else "high" if model.startswith("glm-5.2") else True
    # Governance enforcement (points 3 and 4)
    is_cloud_model="glm" in model or "cloud" in model
    is_translation=a.agent=="localization-editor" or "translation" in a.task_class
    is_certification="certif" in a.task.lower() or a.task_class in ("architecture","release-arbitration")
    if is_cloud_model and is_translation and gov.get("translations_local_only",True):
        model=s.local_model; d=type(d)("local-translation-override",model,"translations_local_only policy forced local execution.")
        think="medium"; is_cloud_model=False
    if is_cloud_model and not is_certification and gov.get("cloud_final_arbitration_only",True):
        model=s.local_model; d=type(d)("local-arbitration-only-override",model,"cloud_final_arbitration_only policy: cloud reserved for certification tasks only.")
        think="medium"; is_cloud_model=False
    runtime=ToolRuntime(ws,policy,a.write and s.write_enabled,not a.no_shell and s.shell_enabled)
    registry=ToolRegistry(runtime,root/"tools/schemas"); ledger=AuditLedger(ws/s.audit_dir,True)
    # Build usage tracker with governance limits from router.json
    router_config=json.loads((root/"config/router.json").read_text(encoding="utf-8"))
    gov=router_config.get("usage_governor",{})
    from datetime import datetime, timezone
    task_id=f"bb-{a.task_class}-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
    usage_tracker=UsageTracker(
        task_id=task_id,
        max_provider_requests=gov.get("max_provider_requests_per_bb",25),
        max_agent_steps_cloud=gov.get("max_agent_steps_cloud",4),
        max_cloud_retries=gov.get("cloud_retries",0),
        max_session_usage_delta_pp=gov.get("max_session_usage_delta_pp",5.0),
        ledger_path=ws/s.audit_dir/f"usage-{task_id}.json",
    )
    prompt=(root/"agents"/a.agent/f"{a.locale}.md").read_text(encoding="utf-8")
    prompt+=f"\n\nSelected route: {d.profile}. Reason: {d.reason}"
    loop=AgentLoop(s.host,model,think,registry,ledger,policy.get("redact_patterns",[]),
                   a.max_steps or s.max_steps,a.write and s.write_enabled,
                   not a.no_shell and s.shell_enabled,a.web,usage_tracker=usage_tracker)
    r=loop.run(prompt,a.task)
    print(r.content)
    if r.usage_report:
        print(f"\n[usage] provider_requests={r.provider_requests} cloud={r.usage_report.get('cloud_requests',0)} local={r.usage_report.get('local_requests',0)} budget={r.usage_report.get('within_budget')}")
    print(f"\n[model={r.model} steps={r.steps} stop={r.stop_reason} audit={ledger.path}]")
    return 0 if r.stop_reason=="completed" else 2

if __name__=="__main__": raise SystemExit(main())
