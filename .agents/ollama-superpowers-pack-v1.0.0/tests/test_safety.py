from pathlib import Path
import pytest
from ollama_superpowers.safety import resolve_inside, PolicyError, validate_command
def test_inside(tmp_path): assert resolve_inside(tmp_path,"a.txt")==tmp_path/"a.txt"
def test_escape(tmp_path):
    with pytest.raises(PolicyError): resolve_inside(tmp_path,"../x")
def test_allowlist(): validate_command(["git","status"],{"git"},[])
def test_deny():
    with pytest.raises(PolicyError): validate_command(["git","reset","--hard"],{"git"},["git reset --hard"])
