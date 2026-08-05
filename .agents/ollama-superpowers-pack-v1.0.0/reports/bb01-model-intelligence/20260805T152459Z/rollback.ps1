# BB01 Rollback Script
# Restores files modified during BB01 execution
# Only reverses changes made in this run

$PackRoot = "{PACK_ROOT}"
Set-Location $PackRoot

# No functional files were modified during BB01.
# Only artifacts were created under reports/bb01-model-intelligence/.
# To remove this run's artifacts:
$RunDir = "{RUN_DIR}"
if (Test-Path $RunDir) {
    Remove-Item -Recurse -Force $RunDir -ErrorAction SilentlyContinue
    Write-Host "[BB01] Removed $RunDir"
} else {
    Write-Host "[BB01] Run directory already removed"
}

# Restore .venv if needed (venv was created, not modified from existing)
# To remove venv: Remove-Item -Recurse -Force .venv
# To recreate: python -m venv .venv && .\.venv\Scripts\python.exe -m pip install -e .

Write-Host "[BB01] Rollback complete."
