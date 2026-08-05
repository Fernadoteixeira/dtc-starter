# Repository findings

The Ollama repository exposes a capability stack larger than basic local chat:

- REST API, official Python and JavaScript SDKs
- streaming
- single, parallel and multi-turn tool calling
- thinking fields and effort controls
- local structured outputs and schema validation
- cloud offload through the local host
- Web Search and Web Fetch with authentication
- OpenAI-compatible and partial Anthropic-compatible APIs
- embeddings and vision through appropriate models
- launch integrations for coding agents and assistants
- Modelfile-based customization and model lifecycle operations

The pack does not pretend every capability belongs to every model. It separates
native host capabilities, model capabilities, authenticated services and composed
capabilities such as RAG.
