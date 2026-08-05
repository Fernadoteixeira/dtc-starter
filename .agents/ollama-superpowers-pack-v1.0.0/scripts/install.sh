#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
PULL=false; OPTIONAL=false
for arg in "$@"; do
  case "$arg" in --pull-models) PULL=true;; --optional-models) OPTIONAL=true;; esac
done
command -v python3 >/dev/null || { echo "Python 3.11+ required"; exit 1; }
command -v ollama >/dev/null || { echo "Ollama CLI required"; exit 1; }
python3 -m venv .venv; . .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e .
if $PULL; then ollama pull gpt-oss:20b; fi
if $OPTIONAL; then ollama pull embeddinggemma; ollama pull gemma4; fi
echo "Installed. Run: ollama signin"
echo "Then: .venv/bin/ollama-superpowers-doctor"
