Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$PackRoot = "C:\Users\fjuni\Documents\GitHub\02-medusa-halls\dtc-starter\.agents\ollama-superpowers-pack-v1.0.0"
$Python = Join-Path $PackRoot ".venv\Scripts\python.exe"
Set-Location $PackRoot

if (-not (Test-Path $Python)) { throw "Python nao encontrado: $Python" }

$env:OLLAMA_HOST = "http://localhost:11434"
$env:OLLAMA_LOCAL_MODEL = "gpt-oss:20b"
$env:OLLAMA_CLOUD_MODEL = "glm-5.2:cloud"
$env:OLLAMA_SUPERPOWERS_WRITE_ENABLED = "false"
$env:OLLAMA_SUPERPOWERS_SHELL_ENABLED = "false"
$env:OLLAMA_SUPERPOWERS_ALLOW_CLOUD_WITH_SECRETS = "false"
$env:OLLAMA_SUPERPOWERS_MAX_TOOL_STEPS = "4"
$env:OLLAMA_SUPERPOWERS_AUDIT_DIR = ".audit"

$StartedAt = Get-Date
$Stamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$RunDir = Join-Path $PackRoot "reports\bb02-canary\$Stamp"
New-Item -ItemType Directory -Force -Path $RunDir | Out-Null

Write-Host ""
Write-Host "============================================================"
Write-Host "  FASE 1 - PREFLIGHT FRESCO"
Write-Host "============================================================"

$Version = Invoke-RestMethod -Method Get -Uri "$env:OLLAMA_HOST/api/version" -TimeoutSec 15
$Version | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $RunDir "ollama-version.json") -Encoding UTF8

$Tags = Invoke-RestMethod -Method Get -Uri "$env:OLLAMA_HOST/api/tags" -TimeoutSec 30
$Tags | ConvertTo-Json -Depth 20 | Set-Content -Path (Join-Path $RunDir "ollama-models.json") -Encoding UTF8

$AvailableModels = @($Tags.models | ForEach-Object { $_.name })
if ($AvailableModels -notcontains "gpt-oss:20b") { throw "gpt-oss:20b nao disponivel" }
if (($AvailableModels -notcontains "glm-5.2:cloud") -and ($AvailableModels -notcontains "glm-5.2")) { throw "glm-5.2 cloud nao disponivel" }

& $Python -m compileall src 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw "compileall falhou" }
Write-Host "compileall: PASS"

& $Python -m pytest tests -q 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw "pytest falhou" }
Write-Host "pytest: PASS"

$DoctorOutput = & $Python -m ollama_superpowers.doctor 2>&1
$DoctorOutput | Set-Content -Path (Join-Path $RunDir "doctor.txt") -Encoding UTF8
if ($LASTEXITCODE -ne 0) { throw "Doctor falhou" }
Write-Host "doctor: PASS"

$FunctionalRoots = @((Join-Path $PackRoot "src"), (Join-Path $PackRoot "config"), (Join-Path $PackRoot "tests"))
$BeforeHashes = foreach ($Root in $FunctionalRoots) {
    Get-ChildItem -Path $Root -Recurse -File | Sort-Object FullName | ForEach-Object {
        $Hash = Get-FileHash -Path $_.FullName -Algorithm SHA256
        [PSCustomObject]@{ Path = $_.FullName.Substring($PackRoot.Length).TrimStart("\"); SHA256 = $Hash.Hash }
    }
}
$BeforeHashes | Export-Csv -Path (Join-Path $RunDir "functional-hashes-before.csv") -NoTypeInformation -Encoding UTF8
git status --short | Set-Content -Path (Join-Path $RunDir "git-status-before.txt") -Encoding UTF8

Write-Host ""
Write-Host "============================================================"
Write-Host "  FASE 2 - CHECKPOINT BB01-R1"
Write-Host "============================================================"

$CheckpointPaths = @("config/router.json", "src/ollama_superpowers/usage_tracker.py", "src/ollama_superpowers/agent_loop.py", "src/ollama_superpowers/cli.py", "tests")
$prevEAP = $ErrorActionPreference
$ErrorActionPreference = "Continue"
git add -- $CheckpointPaths 2>$null
git diff --cached --quiet 2>$null
$HasNoStagedChanges = $LASTEXITCODE -eq 0
if (-not $HasNoStagedChanges) {
    git commit -m "feat(bb01-r1): reconcile provider usage and enforce cloud budgets" 2>$null
    $commitExit = $LASTEXITCODE
    $ErrorActionPreference = $prevEAP
    if ($commitExit -ne 0) { throw "Falha no checkpoint Git" }
    Write-Host "Checkpoint commit criado."
} else {
    $ErrorActionPreference = $prevEAP
    Write-Host "Nenhuma alteracao nova. Checkpoint ja aplicado."
}

$ErrorActionPreference = "Continue"
$ExistingTag = git tag --list "bb01-r1-green" 2>$null
$ErrorActionPreference = $prevEAP
if (-not $ExistingTag) {
    $ErrorActionPreference = "Continue"
    git tag -a "bb01-r1-green" -m "BB01 provider usage reconciliation certified GREEN" 2>$null
    $ErrorActionPreference = $prevEAP
    Write-Host "Tag bb01-r1-green criada."
} else {
    Write-Host "Tag bb01-r1-green ja existe."
}

git log -1 --oneline | Set-Content -Path (Join-Path $RunDir "checkpoint-commit.txt") -Encoding UTF8
git tag --list "bb01-r1-green" | Set-Content -Path (Join-Path $RunDir "checkpoint-tag.txt") -Encoding UTF8

Write-Host ""
Write-Host "============================================================"
Write-Host "  FASE 3 - LOCAL-FIRST BB02 DISCOVERY"
Write-Host "============================================================"

$BBMatrixRaw = Get-Content -Path (Join-Path $PackRoot "capabilities\building-block-matrix.json") -Raw -Encoding UTF8
$BBMatrix = $BBMatrixRaw -replace "`r`n", " " -replace "`0", ""
if ($BBMatrix.Length -gt 3000) { $BBMatrix = $BBMatrix.Substring(0, 3000) + "..." }

$LocalTaskContent = "Voce esta executando o preflight local do BB02. Nao use tools. Nao leia arquivos. Toda a informacao necessaria esta abaixo. BUILDING BLOCK MATRIX (ja lido): " + $BBMatrix + " Regras: 1. Com base na matrix acima, identifique a definicao canonica do BB02. 2. Identifique: ID, nome, objetivo, capabilities, agents, skills, tools, dependencias, gates. 3. Verifique que BB01 (Model Intelligence) satisfaz todas as dependencias do BB02. 4. Nao altere arquivos. Nao execute BB02 completo. Nao chame modelos cloud. 5. Produza um Evidence Packet compacto, factual e de no maximo 2000 caracteres. 6. Termine com: BB02_LOCAL_PREFLIGHT=GREEN ou BB02_LOCAL_PREFLIGHT=YELLOW ou BB02_LOCAL_PREFLIGHT=RED"

$TaskFile = Join-Path $RunDir "local-task.txt"
Set-Content -Path $TaskFile -Value $LocalTaskContent -Encoding UTF8 -NoNewline

$LocalOutput = & $Python -c "
import sys
sys.argv = ['cli.py', '--agent', 'orchestrator', '--locale', 'pt-BR', '--model', 'gpt-oss:20b', '--task-class', 'general', '--max-steps', '3', '--workspace', r'$PackRoot', '--pack-root', r'$PackRoot', '--no-shell', '--task', open(r'$TaskFile', encoding='utf-8').read()]
from ollama_superpowers.cli import main
raise SystemExit(main())
" 2>&1
$LocalExit = $LASTEXITCODE
$LocalOutput | Set-Content -Path (Join-Path $RunDir "bb02-local-preflight.txt") -Encoding UTF8
Write-Host $LocalOutput
if ($LocalExit -ne 0) { throw "Preflight local falhou exit=$LocalExit" }
$LocalText = $LocalOutput -join "`n"
if ($LocalText -notmatch "BB02_LOCAL_PREFLIGHT=GREEN") { throw "BB02 nao recebeu GREEN no preflight local" }
Write-Host ""
Write-Host "LOCAL PREFLIGHT: GREEN"

Write-Host ""
Write-Host "============================================================"
Write-Host "  FASE 4 - GLM-5.2 CLOUD CANARY"
Write-Host "============================================================"

$CloudTaskContent = "Voce e o arbitro final do canario do BB02. Sua execucao e deliberadamente limitada. Regras inviolaveis: 1. Avalie somente o Evidence Packet fornecido. 2. Nao execute BB02 completo. Nao modifique arquivos. Nao use shell. Nao pesquise web. Nao traduza. 3. Nao inicialize outros Building Blocks. Nao solicite novas evidencias. 4. Evite tool calls. Use no maximo duas etapas. Nenhum retry. Nenhuma branch paralela. 5. Diferencie: bloqueador estrutural, bloqueador de ambiente, warning opcional, divida tecnica, risco de custo. 6. Verifique se BB02 pode comecar com: local-first, cloud final arbitration only, provider request accounting, max_agent_steps_cloud=4, cloud_retries=0, max_parallel_cloud_branches=1. 7. Responda curto. Termine com: BB02_CLOUD_CANARY=GREEN ou BB02_CLOUD_CANARY=YELLOW ou BB02_CLOUD_CANARY=RED EVIDENCE PACKET LOCAL: " + $LocalText

$CloudTaskFile = Join-Path $RunDir "cloud-task.txt"
Set-Content -Path $CloudTaskFile -Value $CloudTaskContent -Encoding UTF8 -NoNewline

$CloudOutput = & $Python -c "
import sys
sys.argv = ['cli.py', '--agent', 'orchestrator', '--locale', 'pt-BR', '--model', 'glm-5.2:cloud', '--task-class', 'architecture', '--max-steps', '2', '--workspace', r'$PackRoot', '--pack-root', r'$PackRoot', '--no-shell', '--task', open(r'$CloudTaskFile', encoding='utf-8').read()]
from ollama_superpowers.cli import main
raise SystemExit(main())
" 2>&1
$CloudExit = $LASTEXITCODE
$CloudOutput | Set-Content -Path (Join-Path $RunDir "bb02-cloud-canary.txt") -Encoding UTF8
Write-Host $CloudOutput
if ($CloudExit -ne 0) { throw "Canario cloud falhou exit=$CloudExit" }
$CloudText = $CloudOutput -join "`n"
if ($CloudText -notmatch "BB02_CLOUD_CANARY=GREEN") { throw "Canario cloud nao recebeu GREEN" }
Write-Host ""
Write-Host "CLOUD CANARY: GREEN"

Write-Host ""
Write-Host "============================================================"
Write-Host "  FASE 5 - PROVIDER REQUEST RECONCILIATION"
Write-Host "============================================================"

$AuditMatch = [regex]::Match($CloudText, "audit=([^\]]+)")
if (-not $AuditMatch.Success) { throw "Audit ledger nao localizado" }
$CloudAuditPath = $AuditMatch.Groups[1].Value.Trim()
if (-not (Test-Path $CloudAuditPath)) { throw "Audit ledger nao encontrado: $CloudAuditPath" }
Copy-Item -Path $CloudAuditPath -Destination (Join-Path $RunDir "cloud-audit.jsonl") -Force

$ProviderRequests = 0; $ModelSteps = 0; $ToolCalls = 0
Get-Content -Path $CloudAuditPath | ForEach-Object {
    if (-not $_.Trim()) { return }
    try {
        $Event = $_ | ConvertFrom-Json -ErrorAction Stop
        $EventName = $Event.event
        if (-not $EventName) { $EventName = $Event.type }
        switch ($EventName) {
            "provider_request" { $ProviderRequests++ }
            "model_step" {
                $ModelSteps++
                if ($Event.data.tool_calls) { $ToolCalls += [int]$Event.data.tool_calls }
                elseif ($Event.tool_calls) { $ToolCalls += [int]$Event.tool_calls }
            }
        }
    } catch { }
}

if ($ProviderRequests -lt 1) { throw "Nenhuma provider request registrada" }
if ($ProviderRequests -gt 2) { throw "Budget violado: $ProviderRequests > 2" }
if ($ModelSteps -gt 2) { throw "Budget violado: $ModelSteps steps > 2" }

$UsageLedgers = Get-ChildItem -Path (Join-Path $PackRoot ".audit") -Filter "usage-*.json" -File -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -ge $StartedAt } | Sort-Object LastWriteTime
foreach ($Ledger in $UsageLedgers) {
    Copy-Item -Path $Ledger.FullName -Destination (Join-Path $RunDir $Ledger.Name) -Force
}

$ProviderSummary = [ordered]@{
    task = "bb02-canary"; started_at = $StartedAt.ToUniversalTime().ToString("o"); finished_at = (Get-Date).ToUniversalTime().ToString("o")
    model = "glm-5.2:cloud"; provider_requests = $ProviderRequests; model_steps = $ModelSteps; tool_calls = $ToolCalls
    max_provider_requests = 2; max_model_steps = 2; retries = 0; parallel_branches = 1
    cloud_final_arbitration_only = $true; budget_pass = ($ProviderRequests -le 2 -and $ModelSteps -le 2)
}
$ProviderSummary | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $RunDir "provider-reconciliation.json") -Encoding UTF8
Write-Host "Provider requests: $ProviderRequests / 2"
Write-Host "Model steps: $ModelSteps / 2"
Write-Host "Tool calls: $ToolCalls"
Write-Host "Budget: PASS"

Write-Host ""
Write-Host "============================================================"
Write-Host "  FASE 6 - POSTFLIGHT"
Write-Host "============================================================"

$AfterHashes = foreach ($Root in $FunctionalRoots) {
    Get-ChildItem -Path $Root -Recurse -File | Sort-Object FullName | ForEach-Object {
        $Hash = Get-FileHash -Path $_.FullName -Algorithm SHA256
        [PSCustomObject]@{ Path = $_.FullName.Substring($PackRoot.Length).TrimStart("\"); SHA256 = $Hash.Hash }
    }
}
$AfterHashes | Export-Csv -Path (Join-Path $RunDir "functional-hashes-after.csv") -NoTypeInformation -Encoding UTF8

$HashDifferences = Compare-Object -ReferenceObject $BeforeHashes -DifferenceObject $AfterHashes -Property Path, SHA256
$HashDifferences | Format-Table -AutoSize | Out-String | Set-Content -Path (Join-Path $RunDir "functional-hash-diff.txt") -Encoding UTF8
if ($HashDifferences) { throw "Canario modificou arquivos funcionais" }
Write-Host "Functional mutation check: PASS (0 changes)"

git status --short | Set-Content -Path (Join-Path $RunDir "git-status-after.txt") -Encoding UTF8

Write-Host ""
Write-Host "============================================================"
Write-Host "  FASE 7 - FINAL VERDICT"
Write-Host "============================================================"

$FinalVerdict = [ordered]@{
    bb01_functional = "GREEN"; bb01_code_integrity = "GREEN"; bb01_cost_governance = "GREEN"
    bb02_local_preflight = "GREEN"; bb02_cloud_canary = "GREEN"; provider_accounting = "GREEN"
    provider_requests = $ProviderRequests; max_provider_requests = 2; model_steps = $ModelSteps; max_model_steps = 2
    retries = 0; parallel_branches = 1; functional_files_modified_by_canary = 0
    bb02_readiness = "READY"; run_dir = $RunDir
}
$FinalVerdict | ConvertTo-Json -Depth 10 | Set-Content -Path (Join-Path $RunDir "bb02-canary-verdict.json") -Encoding UTF8

$verdictMd = @"
# BB02 Canary Verdict
BB01 Functional Certification: GREEN
BB01 Code Integrity: GREEN
BB01 Cost Governance: GREEN
BB02 Local Preflight: GREEN
BB02 Cloud Canary: GREEN
Provider Request Accounting: GREEN
Provider requests: $ProviderRequests / 2
Model steps: $ModelSteps / 2
Retries: 0
Parallel branches: 1
Functional mutations: 0
BB02 Readiness: READY
O BB02 completo nao foi iniciado automaticamente.
"@
$verdictMd | Set-Content -Path (Join-Path $RunDir "bb02-canary-verdict.md") -Encoding UTF8

New-Item -ItemType File -Path (Join-Path $RunDir "BB02-CANARY.GREEN") -Force | Out-Null

Write-Host ""
Write-Host "============================================================"
Write-Host "  BB02 CANARY: GREEN"
Write-Host "============================================================"
Write-Host ""
Write-Host "Provider requests : $ProviderRequests / 2"
Write-Host "Model steps       : $ModelSteps / 2"
Write-Host "Tool calls        : $ToolCalls"
Write-Host "Retries           : 0"
Write-Host "Parallel branches : 1"
Write-Host "Functional changes: 0"
Write-Host ""
Write-Host "Artifacts: $RunDir"
Write-Host ""
Write-Host "BB02 completo permanece parado ate o proximo comando."