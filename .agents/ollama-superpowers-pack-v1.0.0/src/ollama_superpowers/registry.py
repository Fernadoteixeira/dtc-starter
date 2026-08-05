from __future__ import annotations
import json
from pathlib import Path
from .tools import ToolRuntime

class ToolRegistry:
    def __init__(self,runtime:ToolRuntime,schema_dir:Path):
        self.runtime=runtime; self.schema_dir=schema_dir
        self.functions={name:getattr(runtime,name) for name in [
            "list_files","read_file","search_text","write_file","run_command","git_status","git_diff","git_log",
            "repo_map","json_validate","calculate","http_check","process_port","web_search","web_fetch"
        ]}

    def schemas(self,include_write=False,include_shell=True,include_web=False):
        names=list(self.functions)
        if not include_write: names.remove("write_file")
        if not include_shell: names.remove("run_command")
        if not include_web: names=[n for n in names if n not in {"web_search","web_fetch"}]
        return [json.loads((self.schema_dir/f"{n}.json").read_text(encoding="utf-8")) for n in names]

    def execute(self,name,arguments):
        if name not in self.functions: raise KeyError(f"Unknown tool: {name}")
        return self.functions[name](**arguments)
