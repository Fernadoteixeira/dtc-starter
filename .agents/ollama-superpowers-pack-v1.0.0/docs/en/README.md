# Ollama Superpowers Pack

A governed agent runtime optimized for local `gpt-oss:20b` and long-horizon `glm-5.2:cloud`.

## Início rápido / Quick start

1. Install Ollama and verify with `ollama --version`.
2. Pull the local model: `ollama pull gpt-oss:20b`.
3. Sign in for cloud: `ollama signin`.
4. Copy `.env.example` to `.env`.
5. Run `scripts/install.ps1 -PullModels` on Windows or `scripts/install.sh --pull-models` on Linux/macOS.
6. Run `ollama-superpowers-doctor`.
7. Start with:
   `ollama-superpowers --agent repo-cartographer --task "Map this repository" --workspace .`

## Arquitetura / Architecture

The architecture has seven layers: capability probe, twin-brain router, context cartographer, tool mesh, agent loop, verification gates and evidence ledger. Read-only is the default. Writes require both a call flag and an enabling environment variable.

## Otimização / Optimization

The supplied usage screen shows concentrated `glm-5.2` use and almost no `gpt-oss:20b` use. This pack reverses that imbalance: routine, private and structured work stays local; GLM is reserved for long-context synthesis, cross-cutting architecture and long trajectories. The screenshot usage values are observational only and are not fetched automatically.
