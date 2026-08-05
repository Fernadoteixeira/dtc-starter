# Codex integration

Ollama exposes an OpenAI-compatible endpoint at `http://localhost:11434/v1`.
For the official launch path, use:

```powershell
ollama launch codex --model gpt-oss:20b
```

For long-horizon work:

```powershell
ollama launch codex --model glm-5.2:cloud
```

Keep the pack's routing and safety policy outside Codex as the governing layer.
