# Ollama Superpowers Pack - Quick Start

1. Install Ollama and verify with `ollama --version`.
2. Pull the local model: `ollama pull gpt-oss:20b`.
3. Sign in for cloud: `ollama signin`.
4. Copy `.env.example` to `.env`.
5. Run `scripts/install.ps1 -PullModels` on Windows or `scripts/install.sh --pull-models` on Linux/macOS.
6. Run `ollama-superpowers-doctor`.
7. Start with:
   `ollama-superpowers --agent repo-cartographer --task "Map this repository" --workspace .`
