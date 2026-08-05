# System Preflight

## Environment

| Componente | Versão | Status |
|---|---|---|
| OS | Windows 10.0.26200 | OK |
| PowerShell | 5.1.26100.8972 | OK |
| Python | 3.11.9 | OK |
| pip | 26.2 | OK |
| Git | 2.55.0.windows.3 | OK |
| Ollama CLI | 0.32.5 | OK |
| Ollama API | listening | OK |

## Models

| Modelo | Status |
|---|---|
| gpt-oss:20b | available (pulled 13GB) |
| glm-5.2:cloud | available |
| embeddinggemma | missing (optional, WARNING) |
| gemma4 | missing (optional, WARNING) |

## Runtime

| Componente | Status |
|---|---|
| .venv | created |
| Pack installed | editable mode |
| Doctor | YELLOW -> GREEN (after gpt-oss:20b pull) |
| Tests | 12/12 passed |
| Routing matrix | 16/16 passed |

## Overall: GREEN
