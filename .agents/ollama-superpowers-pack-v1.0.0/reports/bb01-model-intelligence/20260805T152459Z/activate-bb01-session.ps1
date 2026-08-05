# BB01 Session Activation Script
# Generated: 2026-08-05T15:24:59Z
# Idempotent: re-run to restore session state

$PackRoot = "C:\Users\fjuni\Documents\GitHub\02-medusa-halls\dtc-starter\.agents\ollama-superpowers-pack-v1.0.0"
Set-Location $PackRoot

# Activate venv
if (Test-Path ".venv\Scripts\Activate.ps1") {
    & .venv\Scripts\Activate.ps1
}

# Non-secret environment variables
$env:OLLAMA_HOST = "http://localhost:11434"
$env:OLLAMA_LOCAL_MODEL = "gpt-oss:20b"
$env:OLLAMA_CLOUD_MODEL = "glm-5.2:cloud"
$env:OLLAMA_EMBED_MODEL = "embeddinggemma"
$env:OLLAMA_VISION_MODEL = "gemma4"
$env:OLLAMA_SUPERPOWERS_WRITE_ENABLED = "false"
$env:OLLAMA_SUPERPOWERS_SHELL_ENABLED = "true"
$env:OLLAMA_SUPERPOWERS_ALLOW_CLOUD_WITH_SECRETS = "false"
$env:OLLAMA_SUPERPOWERS_MAX_TOOL_STEPS = "12"
$env:OLLAMA_SUPERPOWERS_AUDIT_DIR = ".audit"

# Run doctor
Write-Host "[BB01] Running doctor..."
& .venv\Scripts\python.exe -m ollama_superpowers.doctor

Write-Host "[BB01] Session activated. Write=false, Cloud-with-secrets=false."
