# Pack de Superpoderes para Ollama - Quick Start

1. Instale o Ollama e confirme com `ollama --version`.
2. Baixe o modelo local: `ollama pull gpt-oss:20b`.
3. Entre na conta para o cloud: `ollama signin`.
4. Copie `.env.example` para `.env`.
5. Execute `scripts/install.ps1 -PullModels` no Windows ou `scripts/install.sh --pull-models` em Linux/macOS.
6. Rode `ollama-superpowers-doctor`.
7. Inicie com:
   `ollama-superpowers --agent repo-cartographer --task "Mapeie este repositório" --workspace .`
