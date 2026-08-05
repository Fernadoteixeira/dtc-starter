# Routing Matrix

Total cases: 16
Passed: 16
Failed: 0
All passed: True

## Test Cases

| Scenario | Expected | Actual | Pass | Reason |
|---|---|---|---|---|
| general | gpt-oss:20b | gpt-oss:20b | PASS | Local execution is the cheapest capable route. |
| structured | gpt-oss:20b | gpt-oss:20b | PASS | Strict schemas route locally. |
| local privacy | gpt-oss:20b | gpt-oss:20b | PASS | Privacy or secret boundary. |
| secret detected | gpt-oss:20b | gpt-oss:20b | PASS | Privacy or secret boundary. |
| long context | glm-5.2:cloud | glm-5.2:cloud | PASS | Evidence exceeds local soft budget. |
| architecture | glm-5.2:cloud | glm-5.2:cloud | PASS | Task benefits from long-horizon reasoning. |
| cross repo | glm-5.2:cloud | glm-5.2:cloud | PASS | Task benefits from long-horizon reasoning. |
| long debug | glm-5.2:cloud | glm-5.2:cloud | PASS | Task benefits from long-horizon reasoning. |
| release arbitration | glm-5.2:cloud | glm-5.2:cloud | PASS | Task benefits from long-horizon reasoning. |
| vision | gemma4 | gemma4 | PASS | Vision requires an optional multimodal model. |
| embeddings | embeddinggemma | embeddinggemma | PASS | Embeddings require a dedicated model. |
| schema + architecture | gpt-oss:20b | gpt-oss:20b | PASS | Strict schemas route locally. |
| secrets + long context | gpt-oss:20b | gpt-oss:20b | PASS | Privacy or secret boundary. |
| local_only + architecture | gpt-oss:20b | gpt-oss:20b | PASS | Privacy or secret boundary. |
| vision + secrets | gemma4 | gemma4 | PASS | Vision requires an optional multimodal model. |
| embeddings + long context | embeddinggemma | embeddinggemma | PASS | Embeddings require a dedicated model. |

## Precedence Rules

1. Vision (priority 100) beats all
2. Embeddings (priority 95) beats schema/secrets
3. Schema (priority 90) beats local_only/secrets/long-context/task_class
4. Local-only (priority 85) beats secrets/long-context/task_class
5. Secrets (priority 80) beats long-context/task_class
6. Long-context >= 60k (priority 70) beats task_class
7. Task class architecture/cross-repo/long-debug/release-arbitration (priority 60) beats default
8. Default -> gpt-oss:20b

## Verdict: ALL PASSED
