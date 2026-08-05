#!/usr/bin/env bash
set -euo pipefail
curl -s http://localhost:11434/api/chat -H 'Content-Type: application/json' -d '{
  "model":"gpt-oss:20b",
  "messages":[{"role":"user","content":"Reply with exactly GREEN"}],
  "stream":false,
  "think":"low"
}'
