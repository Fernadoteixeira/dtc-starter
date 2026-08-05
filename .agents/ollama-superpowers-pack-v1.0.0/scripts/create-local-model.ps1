$Root=Split-Path -Parent $PSScriptRoot
Set-Location $Root
ollama create superpowers-local -f ".\modelfiles\gpt-oss-superpowers.Modelfile"
ollama show superpowers-local
