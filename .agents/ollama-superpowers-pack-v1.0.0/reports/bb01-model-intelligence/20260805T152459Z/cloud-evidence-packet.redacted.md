# BB01 Evidence Packet (Redacted)
# Prepared for cloud arbitration via glm-5.2:cloud
# No secrets included

## Pack Identity
- name: ollama-superpowers-pack
- version: 1.0.0
- agents: 18
- skills: 28
- tools: 15
- superpowers: 14
- languages: pt-BR, en, es, fr

## BB01 Components
- orchestrator agent: True
- cost-governance skill: True
- http_check tool: True
- glm-5.2:cloud model config: True
- router config: True
- src runtime: True

## System Preflight
- os: Windows 10.0.26200
- python: 3.11.9
- ollama: 0.32.5
- port 11434: listening
- gpt-oss:20b: available (pulled 13GB)
- glm-5.2:cloud: available
- embeddinggemma: missing (optional, WARNING only)
- gemma4: missing (optional, WARNING only)

## Test Results
- pytest: 12/12 passed
- routing matrix: 16/16 passed
- doctor: GREEN

## Local Capability Probe (gpt-oss:20b)
- L1 connectivity: PASS (LOCAL_GREEN)
- L2 thinking: PASS (correct arithmetic)
- L3 tool calling: PASS (http_check tool call with correct URL)
- L4 structured output: PASS (valid JSON with status=GREEN)

## Cloud Capability Probe (glm-5.2:cloud)
- C1 connectivity: PASS (CLOUD_GREEN, requires think=low)
- C2 tool calling: PASS (http_check tool call emitted correctly)

## Usage Governance
- cloud calls used: 3 of 6 max
- local calls used: 4
- retries: 0
- secrets sent to cloud: 0
- within budget: true

## Router Rules Validated
1. vision -> gemma4 (priority 100)
2. embeddings -> embeddinggemma (priority 95)
3. schema -> gpt-oss:20b (priority 90)
4. local_only -> gpt-oss:20b (priority 85)
5. secrets -> gpt-oss:20b (priority 80)
6. long-context >= 60k tokens -> glm-5.2:cloud (priority 70)
7. architecture/cross-repo/long-debug/release-arbitration -> glm-5.2:cloud (priority 60)
8. default -> gpt-oss:20b

## Precedence Tests
- schema + architecture -> gpt-oss:20b (schema wins)
- secrets + long context -> gpt-oss:20b (secrets win)
- local_only + architecture -> gpt-oss:20b (local wins)
- vision + secrets -> gemma4 (vision wins, but secrets block cloud)
- embeddings + long context -> embeddinggemma (embeddings win)

## Files Modified
- None (functional files unchanged)
- .venv created (editable install)
- gpt-oss:20b pulled (13GB)
- Artifacts created under reports/bb01-model-intelligence/

## Inconsistencies
- JSON errors: 0
- Missing translations: 0
- Missing agent.json: 0
- Missing skill.json: 0
- Optional models missing: 2 (embeddinggemma, gemma4) — WARNING only

## Verdict Recommendation
BB01 is OPERATIONAL. All gates pass. Optional models absent but not required.
