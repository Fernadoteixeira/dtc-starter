# Ollama Superpowers Pack v1.0.0

Pack multilíngue e governado para transformar as capacidades nativas do Ollama em agentes operacionais.

Modelos-alvo:

- `gpt-oss:20b`: 14 GB, 128K de contexto, texto, ferramentas, thinking e saídas estruturadas.
- `glm-5.2:cloud`: high usage, 976K de contexto, texto, ferramentas e tarefas de longo horizonte.
- Opcionais: `embeddinggemma` para RAG e `gemma4` para visão.

## Conteúdo

- 18 agentes em pt-BR, inglês, espanhol e francês
- 28 skills reutilizáveis em quatro idiomas
- 15 ferramentas tipadas e protegidas
- roteamento local/cloud com governança de consumo
- fallback de saída estruturada
- auditoria, recuperação e gates de verificação
- instalação para Windows e Linux/macOS
- integrações com APIs compatíveis e launchers
- suíte de testes e avaliações

## Instalação rápida no Windows

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\install.ps1 -PullModels
.\.venv\Scripts\Activate.ps1
ollama-superpowers-doctor
ollama-superpowers --agent repo-cartographer --task "Mapeie este repositório" --workspace .
```

A escrita é desabilitada por padrão. Para uma tarefa aprovada, use simultaneamente:

```powershell
$env:OLLAMA_SUPERPOWERS_WRITE_ENABLED="true"
ollama-superpowers --write ...
```

Consulte [docs/pt-BR/README.md](docs/pt-BR/README.md).
