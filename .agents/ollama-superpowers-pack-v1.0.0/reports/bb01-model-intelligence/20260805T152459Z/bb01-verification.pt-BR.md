# BB01 — Model Intelligence Verification

## 1. Executive summary

O Building Block BB01 (Model Intelligence) está integralmente operacional e reproduzível. Todos os 7 gates de aceite foram aprovados. O pack foi inventariado (18 agents, 28 skills, 15 tools, 14 superpowers, 4 idiomas), o runtime Python foi instalado, o modelo local gpt-oss:20b foi baixado e validado em 4 probes, o modelo cloud glm-5.2:cloud foi validado em 2 probes, o router foi aprovado em 16/16 casos determinísticos, e a governança de consumo está ativa com 3 chamadas cloud usadas de 6 permitidas. Nenhum outro Building Block foi ativado.

## 2. Environment

| Componente | Versão | Status |
|---|---|---|
| Sistema | Windows 10.0.26200 | OK |
| PowerShell | 5.1.26100.8972 | OK |
| Python | 3.11.9 | OK |
| pip | 26.2 | OK |
| Git | 2.55.0.windows.3 | OK |
| Ollama CLI | 0.32.5 | OK |
| Ollama API | http://localhost:11434 | listening |
| .venv | criado | OK |
| Pack instalado | editable mode | OK |

## 3. Pack inventory

| Componente | Quantidade | Status |
|---|---|---|
| Agents | 18 | todos com agent.json e 4 traduções |
| Skills | 28 | todas com skill.json e 4 traduções |
| Tools | 15 | todas com schema JSON |
| Superpowers | 14 | registrados |
| Idiomas | 4 (pt-BR, en, es, fr) | completos |
| JSONs válidos | todos | 0 erros |
| src_files | 11 (ollama_superpowers) | OK |
| Model configs | 4 | OK |
| Scripts | 4 | OK |

Inconsistências: 0 FAIL, 0 WARNING estrutural.

## 4. Model capability matrix

| Capability | gpt-oss:20b | glm-5.2:cloud | Evidence |
|---|---:|---:|---|
| Basic chat | PASS | PASS | LOCAL_GREEN / CLOUD_GREEN |
| Thinking | PASS | PASS | Arithmetic correct / think=low required |
| Tool calling | PASS | PASS | http_check tool call emitted correctly |
| Structured outputs | PASS | NOT_SUPPORTED | JSON valid with schema enforcement |
| Long-context routing | N/A | PASS | Router routes >=60k tokens to cloud |
| Secret-safe routing | PASS | BLOCKED_AS_DESIGNED | Secrets keep local by policy |
| Vision | NOT_TESTED | NOT_TESTED | gemma4 optional, not installed |
| Embeddings | NOT_TESTED | NOT_TESTED | embeddinggemma optional, not installed |

## 5. Routing matrix

16/16 casos passaram. Ver `routing-matrix.json` para detalhes completos.

Precedência confirmada:
- schema + architecture -> gpt-oss:20b (schema vence)
- secrets + long context -> gpt-oss:20b (secrets vence)
- local_only + architecture -> gpt-oss:20b (local vence)
- vision + secrets -> gemma4 (vision vence, secrets bloqueiam cloud)
- embeddings + long context -> embeddinggemma (embeddings vence)

## 6. Usage governance

| Métrica | Valor |
|---|---|
| Máximo de chamadas cloud | 6 |
| Chamadas cloud usadas | 3 |
| Chamadas cloud restantes | 3 |
| Chamadas locais usadas | 4 |
| Retries | 0 |
| Branches paralelas | 1 |
| Tool calls | 2 |
| Secrets enviados ao cloud | 0 |
| Limite atingido | Não |

## 7. Security

- Redaction: nenhum secret exposto em logs, relatórios ou evidence packet.
- Secrets policy: `ALLOW_CLOUD_WITH_SECRETS=false` — secrets permanecem locais.
- Write policy: `WRITE_ENABLED=false` por padrão.
- Cloud boundary: cloud recebe apenas evidence packet redacted, sem secrets.
- Audit: auditoria JSONL habilitada via `AUDIT_DIR=.audit`.

## 8. Changes

| Tipo | Arquivo | Ação |
|---|---|---|
| Criado | `.venv/` | Ambiente virtual Python |
| Instalado | pack em editable mode | pip install -e . |
| Baixado | `gpt-oss:20b` (13GB) | ollama pull |
| Criado | `reports/bb01-model-intelligence/20260805T152459Z/` | 21 artifacts |

Nenhum arquivo funcional do pack foi modificado. Backup não necessário (não houve modificação de arquivos existentes).

## 9. Risks

| Categoria | Item | Severidade |
|---|---|---|
| Warning | embeddinggemma não instalado | P3 (opcional) |
| Warning | gemma4 não instalado | P3 (opcional) |
| Dívida técnica | glm-5.2:cloud requer think=low explícito | P4 (workaround documentado) |
| Limitação | OLLAMA_API_KEY ausente — web_search/web_fetch indisponíveis | P3 (opcional) |

Nenhum blocker. Nenhuma falha estrutural.

## 10. Gates

| Gate | Descrição | Verdict |
|---|---|---|
| G1 | Pack integrity | PASS |
| G2 | Runtime | PASS |
| G3 | Ollama local | PASS |
| G4 | Ollama cloud | PASS |
| G5 | Router | PASS |
| G6 | Usage governance | PASS |
| G7 | BB01 execution | PASS |

## 11. Final verdict

GREEN:
BB01 integralmente operacional e reproduzível.

## 12. Next action

Não iniciar BB02 automaticamente. Para próxima execução, use o script `activate-bb01-session.ps1` para restaurar o estado da sessão. O BB02 pode ser iniciado quando o operador autorizar.
