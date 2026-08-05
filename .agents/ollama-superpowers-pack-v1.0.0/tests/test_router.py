from ollama_superpowers.router import TaskHints, choose_model
def route(h):
    return choose_model(h,"gpt-oss:20b","glm-5.2:cloud","gemma4","embeddinggemma").model
def test_default_local(): assert route(TaskHints())=="gpt-oss:20b"
def test_schema_local(): assert route(TaskHints(requires_schema=True))=="gpt-oss:20b"
def test_long_cloud(): assert route(TaskHints(estimated_input_tokens=70000))=="glm-5.2:cloud"
def test_secret_local(): assert route(TaskHints(secrets_detected=True))=="gpt-oss:20b"
def test_vision(): assert route(TaskHints(requires_vision=True))=="gemma4"
