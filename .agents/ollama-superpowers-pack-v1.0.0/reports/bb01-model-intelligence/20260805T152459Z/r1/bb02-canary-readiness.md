# BB02 Canary Readiness

## Canário Executado

- Task: "Reply with exactly CANARY_GREEN"
- Model: gpt-oss:20b (local, 0 cloud requests)
- Result: CANARY_GREEN
- Provider requests: 1
- Audit ledger: 1 provider_request event
- Usage ledger: 1 request, within budget

## Reconciliação Confirmada

```
1 task → 1 agent step → 1 provider request → 1 audit event → 1 usage ledger entry
```

O medidor interno e o pedágio externo agora leem na mesma escala.

## 4 Pontos de Validação

### Ponto 1: max_agent_steps_cloud hard cap
- Status: IMPLEMENTADO
- O `AgentLoop.__init__` aplica `min(max_steps, max_agent_steps_cloud)` para modelos cloud
- Mesmo que o operador passe `--max-steps 12`, um modelo cloud será limitado a 4

### Ponto 2: max_provider_requests pre-call block
- Status: IMPLEMENTADO
- O `UsageTracker.begin_request()` verifica o budget ANTES da chamada
- `UsageBlocked` exception é levantada antes de `client.chat()` ser executada

### Ponto 3: translations_local_only enforcement
- Status: IMPLEMENTADO no cli.py
- Se `is_translation and is_cloud_model and translations_local_only`, modelo é forçado para local
- O audit ledger registra o override com reason "translations_local_only policy"

### Ponto 4: cloud_final_arbitration_only enforcement
- Status: IMPLEMENTADO no cli.py
- Se `is_cloud_model and not is_certification and cloud_final_arbitration_only`, modelo é forçado para local
- "certification" é detectado por task_class in (architecture, release-arbitration) ou "certif" no task text

## Configuração do Canário BB02

```yaml
bb02_canary:
  max_provider_requests: 2
  max_cloud_agent_steps: 2
  max_parallel_branches: 1
  retries: 0
  thinking: low
  evidence_packet_max_tokens: 6000
  write_enabled: false
```

## Veredito

```text
BB01 Functional Certification:     GREEN
BB01 Provider Request Accounting:  GREEN
BB01 Cost Governance:              GREEN
BB02 Readiness:                     READY WITH CANARY
```
