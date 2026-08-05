# Pack de Superpoderes para Ollama

Runtime governado de agentes, otimizado para `gpt-oss:20b` local e `glm-5.2:cloud` em tarefas de longo horizonte.

## Início rápido / Quick start

1. Instale o Ollama e confirme com `ollama --version`.
2. Baixe o modelo local: `ollama pull gpt-oss:20b`.
3. Entre na conta para o cloud: `ollama signin`.
4. Copie `.env.example` para `.env`.
5. Execute `scripts/install.ps1 -PullModels` no Windows ou `scripts/install.sh --pull-models` em Linux/macOS.
6. Rode `ollama-superpowers-doctor`.
7. Inicie com:
   `ollama-superpowers --agent repo-cartographer --task "Mapeie este repositório" --workspace .`

## Arquitetura / Architecture

A arquitetura possui sete camadas: sonda de capacidades, roteador de dois cérebros, cartógrafo de contexto, malha de ferramentas, loop de agentes, gates de verificação e livro-razão de evidências. A postura padrão é somente leitura. Escritas exigem a flag da chamada e a variável de ambiente de habilitação.

## Otimização / Optimization

O histórico visual fornecido mostra uso concentrado em `glm-5.2` e uso quase nulo de `gpt-oss:20b`. O pack corrige esse desequilíbrio: tarefas rotineiras, privadas e estruturadas ficam locais; o GLM é reservado a síntese de grande contexto, arquitetura transversal e trajetórias longas. O snapshot de uso da tela é apenas observacional e não é consultado automaticamente pelo runtime.
