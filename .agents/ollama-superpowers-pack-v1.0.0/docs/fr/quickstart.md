# Pack de Superpouvoirs pour Ollama - Quick Start

1. Installez Ollama et vérifiez avec `ollama --version`.
2. Téléchargez le modèle local : `ollama pull gpt-oss:20b`.
3. Connectez-vous au cloud : `ollama signin`.
4. Copiez `.env.example` vers `.env`.
5. Exécutez `scripts/install.ps1 -PullModels` sous Windows ou `scripts/install.sh --pull-models` sous Linux/macOS.
6. Exécutez `ollama-superpowers-doctor`.
7. Commencez avec :
   `ollama-superpowers --agent repo-cartographer --task "Cartographiez ce dépôt" --workspace .`
