from __future__ import annotations
import ast, fnmatch, json, operator, os, re, socket, subprocess, urllib.request
from collections import Counter
from pathlib import Path
from typing import Any
from .safety import PolicyError, resolve_inside, validate_command

IGNORED={".git",".next",".turbo",".venv","node_modules","dist","build","coverage","__pycache__",".cache"}

class ToolRuntime:
    def __init__(self, workspace: Path, policy: dict[str,Any], write_enabled: bool, shell_enabled: bool):
        self.workspace=workspace.resolve(); self.policy=policy
        self.write_enabled=write_enabled and bool(policy.get("allow_write",False))
        self.shell_enabled=shell_enabled and bool(policy.get("allow_shell",False))

    def list_files(self,path=".",max_depth=4,limit=300):
        base=resolve_inside(self.workspace,path); rows=[]; base_depth=len(base.parts)
        for current,dirs,files in os.walk(base):
            dirs[:]=sorted(d for d in dirs if d not in IGNORED)
            depth=len(Path(current).parts)-base_depth
            if depth>=max_depth: dirs[:]=[]
            for name in sorted(files):
                rows.append(str((Path(current)/name).relative_to(self.workspace)).replace("\\","/"))
                if len(rows)>=limit: return {"files":rows,"truncated":True}
        return {"files":rows,"truncated":False}

    def read_file(self,path,start_line=1,end_line=None):
        target=resolve_inside(self.workspace,path)
        if target.stat().st_size>int(self.policy.get("max_file_read_bytes",1000000)):
            raise PolicyError("File exceeds read limit")
        lines=target.read_text(encoding="utf-8",errors="replace").splitlines()
        start=max(1,start_line); end=len(lines) if end_line is None else min(len(lines),end_line)
        return {"path":str(target.relative_to(self.workspace)),"start":start,"end":end,
                "content":"\n".join(f"{i}: {lines[i-1]}" for i in range(start,end+1))}

    def search_text(self,query,path=".",glob="*",regex=False,limit=100):
        base=resolve_inside(self.workspace,path); out=[]; matcher=re.compile(query) if regex else None
        for current,dirs,files in os.walk(base):
            dirs[:]=[d for d in dirs if d not in IGNORED]
            for name in files:
                if not fnmatch.fnmatch(name,glob): continue
                target=Path(current)/name
                try:
                    if target.stat().st_size>int(self.policy.get("max_file_read_bytes",1000000)): continue
                    for no,line in enumerate(target.read_text(encoding="utf-8",errors="replace").splitlines(),1):
                        hit=bool(matcher.search(line)) if matcher else query.lower() in line.lower()
                        if hit:
                            out.append({"path":str(target.relative_to(self.workspace)).replace("\\","/"),"line":no,"text":line[:500]})
                            if len(out)>=limit: return {"results":out,"truncated":True}
                except OSError: pass
        return {"results":out,"truncated":False}

    def write_file(self,path,content,create_parents=False):
        if not self.write_enabled: raise PolicyError("Write access is disabled")
        target=resolve_inside(self.workspace,path)
        if create_parents: target.parent.mkdir(parents=True,exist_ok=True)
        elif not target.parent.exists(): raise PolicyError("Parent directory does not exist")
        existed=target.exists(); target.write_text(content,encoding="utf-8",newline="\n")
        return {"path":str(target.relative_to(self.workspace)),"created":not existed,"bytes":len(content.encode())}

    def run_command(self,argv,cwd=".",timeout=None):
        if not self.shell_enabled: raise PolicyError("Shell execution is disabled")
        validate_command(argv,set(self.policy.get("allowed_commands",[])),list(self.policy.get("denied_argument_fragments",[])))
        workdir=resolve_inside(self.workspace,cwd)
        max_t=int(self.policy.get("max_command_seconds",120)); effective=min(timeout or max_t,max_t)
        cp=subprocess.run(argv,cwd=workdir,capture_output=True,text=True,timeout=effective,shell=False,
                          env={**os.environ,"CI":os.environ.get("CI","1")})
        return {"argv":argv,"cwd":str(workdir.relative_to(self.workspace)),"exit_code":cp.returncode,
                "stdout":cp.stdout[-30000:],"stderr":cp.stderr[-30000:]}

    def git_status(self): return self.run_command(["git","status","--short"])
    def git_diff(self,staged=False,path=None):
        argv=["git","diff"]+(["--staged"] if staged else [])+((["--",path]) if path else [])
        r=self.run_command(argv); r["stdout"]=r["stdout"][-50000:]; return r
    def git_log(self,limit=20): return self.run_command(["git","log",f"-{min(limit,100)}","--oneline","--decorate"])

    def repo_map(self,path=".",max_files=3000):
        listing=self.list_files(path,max_depth=8,limit=max_files); files=listing["files"]
        ext=Counter(Path(x).suffix.lower() or "<none>" for x in files)
        manifests=[x for x in files if Path(x).name in {"package.json","pyproject.toml","go.mod","Cargo.toml","pom.xml","build.gradle","docker-compose.yml","Dockerfile","turbo.json","pnpm-workspace.yaml"}]
        entries=[x for x in files if Path(x).name in {"main.py","app.py","index.ts","index.js","main.ts","main.go","Program.cs","server.ts","route.ts","page.tsx"}]
        return {"file_count":len(files),"truncated":listing["truncated"],"extensions":ext.most_common(30),
                "manifests":manifests[:100],"candidate_entry_points":entries[:100]}

    @staticmethod
    def json_validate(value,required_keys=None):
        try: parsed=json.loads(value)
        except json.JSONDecodeError as e: return {"valid":False,"error":str(e)}
        if required_keys:
            if not isinstance(parsed,dict): return {"valid":False,"error":"Top-level value is not an object"}
            missing=[k for k in required_keys if k not in parsed]
        else: missing=[]
        return {"valid":not missing,"missing_keys":missing,"type":type(parsed).__name__}

    @staticmethod
    def calculate(expression):
        ops={ast.Add:operator.add,ast.Sub:operator.sub,ast.Mult:operator.mul,ast.Div:operator.truediv,
             ast.FloorDiv:operator.floordiv,ast.Mod:operator.mod,ast.Pow:operator.pow,ast.USub:operator.neg,ast.UAdd:operator.pos}
        def ev(n):
            if isinstance(n,ast.Expression): return ev(n.body)
            if isinstance(n,ast.Constant) and isinstance(n.value,(int,float)): return n.value
            if isinstance(n,ast.BinOp) and type(n.op) in ops:
                l,r=ev(n.left),ev(n.right)
                if isinstance(n.op,ast.Pow) and abs(r)>100: raise PolicyError("Exponent too large")
                return ops[type(n.op)](l,r)
            if isinstance(n,ast.UnaryOp) and type(n.op) in ops: return ops[type(n.op)](ev(n.operand))
            raise PolicyError("Unsupported expression")
        return {"expression":expression,"result":ev(ast.parse(expression,mode="eval"))}

    @staticmethod
    def http_check(url,method="GET",timeout=10):
        req=urllib.request.Request(url,method=method)
        try:
            with urllib.request.urlopen(req,timeout=timeout) as resp:
                body=resp.read(4096).decode("utf-8",errors="replace")
                return {"ok":200<=resp.status<400,"status":resp.status,"url":url,"body_preview":body}
        except Exception as e:
            return {"ok":False,"url":url,"error":f"{type(e).__name__}: {e}"}

    @staticmethod
    def process_port(port,host="127.0.0.1"):
        sock=socket.socket(); sock.settimeout(1)
        try: listening=sock.connect_ex((host,port))==0
        finally: sock.close()
        detail=""
        try:
            if os.name=="nt":
                cp=subprocess.run(["netstat","-ano"],capture_output=True,text=True,timeout=5)
                detail="\n".join(x for x in cp.stdout.splitlines() if f":{port} " in x)[:4000]
            else:
                cp=subprocess.run(["sh","-lc",f"(ss -ltnp 2>/dev/null || lsof -nP -iTCP:{port} -sTCP:LISTEN 2>/dev/null)"],capture_output=True,text=True,timeout=5)
                detail=cp.stdout[:4000]
        except Exception: pass
        return {"host":host,"port":port,"listening":listening,"process_evidence":detail}

    @staticmethod
    def web_search(query,max_results=5):
        if not os.getenv("OLLAMA_API_KEY"): raise PolicyError("OLLAMA_API_KEY is required")
        import ollama
        r=ollama.web_search(query=query,max_results=max_results)
        return r.model_dump() if hasattr(r,"model_dump") else dict(r)

    @staticmethod
    def web_fetch(url):
        if not os.getenv("OLLAMA_API_KEY"): raise PolicyError("OLLAMA_API_KEY is required")
        import ollama
        r=ollama.web_fetch(url=url)
        return r.model_dump() if hasattr(r,"model_dump") else dict(r)
