from __future__ import annotations
import json, os, shutil, subprocess, sys, urllib.request
from .config import RuntimeSettings

def get_json(url):
    try:
        with urllib.request.urlopen(url,timeout=5) as r: return True,json.loads(r.read().decode())
    except Exception as e: return False,str(e)

def main():
    s=RuntimeSettings.from_env(); checks=[]
    checks.append(("Python >= 3.11",sys.version_info>=(3,11),sys.version.split()[0]))
    exe=shutil.which("ollama"); checks.append(("Ollama CLI",bool(exe),exe or "not found"))
    if exe:
        cp=subprocess.run([exe,"--version"],capture_output=True,text=True)
        checks.append(("Ollama version",cp.returncode==0,(cp.stdout or cp.stderr).strip()))
    ok,payload=get_json(s.host.rstrip("/")+"/api/tags"); checks.append(("Ollama API",ok,s.host))
    models=set()
    if ok and isinstance(payload,dict):
        for item in payload.get("models",[]):
            name=item.get("name") or item.get("model")
            if name: models.add(name)
    local=s.local_model in models
    checks.append((f"Local model {s.local_model}",local,"installed" if local else "missing"))
    checks.append(("OLLAMA_API_KEY",bool(os.getenv("OLLAMA_API_KEY")),"configured" if os.getenv("OLLAMA_API_KEY") else "optional and absent"))
    print("\nOllama Superpowers Doctor\n")
    required=True
    for name,passed,detail in checks:
        print(f"[{'PASS' if passed else 'WARN'}] {name}: {detail}")
        if name in {"Python >= 3.11","Ollama CLI","Ollama API"} and not passed: required=False
    print("\nDetected models:")
    print("\n".join(f"  - {m}" for m in sorted(models)) or "  - none")
    verdict="GREEN" if required and local else "YELLOW" if required else "RED"
    print("\nVerdict:",verdict)
    return 0 if required else 1

if __name__=="__main__": raise SystemExit(main())
