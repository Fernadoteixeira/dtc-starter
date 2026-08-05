# Pack de Superpouvoirs pour Ollama

Runtime d'agents gouverné, optimisé pour `gpt-oss:20b` local et `glm-5.2:cloud` à long horizon.

## Início rápido / Quick start

1. Installez Ollama et vérifiez avec `ollama --version`.
2. Téléchargez le modèle local : `ollama pull gpt-oss:20b`.
3. Connectez-vous au cloud : `ollama signin`.
4. Copiez `.env.example` vers `.env`.
5. Exécutez `scripts/install.ps1 -PullModels` sous Windows ou `scripts/install.sh --pull-models` sous Linux/macOS.
6. Exécutez `ollama-superpowers-doctor`.
7. Commencez avec :
   `ollama-superpowers --agent repo-cartographer --task "Cartographiez ce dépôt" --workspace .`

## Arquitetura / Architecture

L'architecture comporte sept couches : sonde de capacités, routeur à deux cerveaux, cartographe de contexte, maillage d'outils, boucle d'agents, gates de vérification et registre de preuves. La lecture seule est la posture par défaut. L'écriture nécessite deux activations.

## Otimização / Optimization

L'écran d'utilisation fourni montre un usage concentré de `glm-5.2` et presque aucun usage de `gpt-oss:20b`. Le pack corrige ce déséquilibre : les tâches courantes, privées et structurées restent locales ; GLM est réservé à la synthèse de grand contexte, à l'architecture transversale et aux trajectoires longues. Les valeurs de la capture sont observationnelles et ne sont pas récupérées automatiquement.
