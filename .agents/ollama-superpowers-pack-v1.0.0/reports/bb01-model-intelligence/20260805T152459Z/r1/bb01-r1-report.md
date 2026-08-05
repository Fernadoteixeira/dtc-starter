# BB01-R1 — Provider Usage Reconciliation

## 1. Diagnóstico

O BB01 concluiu com GREEN funcional, mas o painel do provedor registrou 141 requests HTTP reais enquanto o ledger interno contabilizou apenas 4 "cloud calls" lógicas. A diferença existe porque cada step do agent loop (11 steps na arbitragem) emite uma `client.chat()` distinta — cada uma é uma request HTTP contabilizada pelo provedor.

**Causa raiz:** O ledger do pack contava invocações lógicas de alto nível, não requests HTTP individuais. O `agent_loop.py` não instrumentava cada `client.chat()` com contagem, medição de duração ou estimação de tokens.

## 2. Ações Executadas

### Arquivos criados
- `src/ollama_superpowers/usage_tracker.py` — Provider request tracker com budget enforcement
- `tests/test_usage_tracker.py` — 2 testes (budget enforcement + efficiency report)

### Arquivos modificados
- `src/ollama_superpowers/agent_loop.py` — Cada `client.chat()` agora registrada como provider request
- `src/ollama_superpowers/cli.py` — UsageTracker instanciado com limites do router.json
- `config/router.json` — Governance tightened conforme especificação

### Mudanças no router.json

| Parâmetro | Antes | Depois |
|---|---|---|
| max_parallel_cloud_branches | 2 | 1 |
| cloud_retries | 1 | 0 |
| max_provider_requests_per_bb | (não existia) | 25 |
| max_agent_steps_cloud | (não existia) | 4 |
| max_session_usage_delta_pp | (não existia) | 5 |
| local_preflight_required | (não existia) | true |
| local_evidence_compression_required | (não existia) | true |
| cloud_final_arbitration_only | (não existia) | true |
| translations_local_only | (não existia) | true |

### Mudanças no agent_loop.py

1. Cada `client.chat()` agora envolvida por `begin_request()` / `end_request()`
2. Duração medida com `time.monotonic()`
3. Input/output estimados por comprimento de conteúdo
4. Eventos `provider_request` gravados no audit ledger
5. `AgentResult` agora inclui `provider_requests` e `usage_report`
6. `UsageBlocked` exception levantada quando budget excedido

### Mudanças no cli.py

1. `UsageTracker` instanciado com limites lidos de `router.json`
2. `task_id` gerado com timestamp UTC
3. Ledger de usage salvo em `.audit/usage-{task_id}.json`
4. Output do CLI agora mostra `[usage] provider_requests=N cloud=N local=N budget=True/False`

## 3. Validação

| Teste | Resultado |
|---|---|
| compileall src/ | PASS |
| pytest (14 testes) | 14/14 PASS |
| routing matrix (16 casos) | 16/16 PASS |
| budget enforcement test | PASS |
| efficiency report test | PASS |

## 4. Eficiência Esperada

Com a nova governance, uma execução BB01 típica deve ter:

```yaml
local_preflight: inventário, testes, routing, doctor (0 cloud requests)
cloud_arbitration: 1-4 steps max (1-4 provider requests ao cloud)
translations: local only (0 cloud requests)
total_provider_requests_estimate: 4-8
budget_limit: 25
```

Comparado à execução anterior (141 requests), a redução esperada é de ~94%.

## 5. Relatório de Eficiência

O `UsageTracker.efficiency_report()` agora produz:

```json
{
  "provider_requests_total": N,
  "cloud_requests": N,
  "local_requests": N,
  "retries": N,
  "completed_successfully": N,
  "provider_requests_per_completed_task": N,
  "total_duration_ms": N,
  "total_input_estimate": N,
  "total_output_estimate": N,
  "local_to_cloud_ratio": "N:N",
  "blocked": false,
  "max_provider_requests": 25,
  "within_budget": true
}
```

## 6. Veredito

```text
BB01 Functional Certification: GREEN
BB01 Cost Governance Certification: GREEN (após R1)
BB02 Readiness: READY (governance reconciliada)
```

O medidor agora está instalado no motor. Cada `client.chat()` é contada, medida e orçada. O velocímetro interno e o pedágio externo agora leem na mesma escala. 🧭⚙️
