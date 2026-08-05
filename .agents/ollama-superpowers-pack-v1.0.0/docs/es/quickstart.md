# Paquete de Superpoderes para Ollama - Quick Start

1. Instala Ollama y verifica con `ollama --version`.
2. Descarga el modelo local: `ollama pull gpt-oss:20b`.
3. Inicia sesión para cloud: `ollama signin`.
4. Copia `.env.example` a `.env`.
5. Ejecuta `scripts/install.ps1 -PullModels` en Windows o `scripts/install.sh --pull-models` en Linux/macOS.
6. Ejecuta `ollama-superpowers-doctor`.
7. Empieza con:
   `ollama-superpowers --agent repo-cartographer --task "Mapea este repositorio" --workspace .`
