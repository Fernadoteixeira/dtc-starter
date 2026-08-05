from ollama_superpowers.tools import ToolRuntime
def test_json(): assert ToolRuntime.json_validate('{"a":1}',["a"])["valid"]
def test_calc(): assert ToolRuntime.calculate("(2+3)*4")["result"]==20
