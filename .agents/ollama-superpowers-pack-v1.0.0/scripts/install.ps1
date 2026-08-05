param([switch]$PullModels,[switch]$InstallOptionalModels)
$ErrorActionPreference="Stop"
$Root=Split-Path -Parent $PSScriptRoot
Set-Location $Root
if(-not (Get-Command python -ErrorAction SilentlyContinue)){throw "Python 3.11+ not found."}
if(-not (Get-Command ollama -ErrorAction SilentlyContinue)){throw "Ollama CLI not found."}
if(-not (Test-Path ".venv")){python -m venv .venv}
& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\python.exe" -m pip install -e .
if($PullModels){ollama pull gpt-oss:20b}
if($InstallOptionalModels){ollama pull embeddinggemma; ollama pull gemma4}
Write-Host "Installed. Run: ollama signin"
Write-Host "Then: .\.venv\Scripts\ollama-superpowers-doctor.exe"
