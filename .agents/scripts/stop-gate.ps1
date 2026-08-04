$null = [Console]::In.ReadToEnd()
$v = New-Object System.Collections.Generic.List[string]
try {
  $s = git status --short --untracked-files=all 2>$null
  foreach ($line in $s) {
    if ($line -match 'apps/storefront/src/app/globals\.css') { $v.Add("globals.css modified") }
    if ($line -match 'pnpm-lock\.yaml|package\.json') { $v.Add("package metadata modified") }
    if ($line -match '\.github/workflows|playwright\.config') { $v.Add("CI or Playwright modified") }
  }
  $sub = git -C apps/storefront/src/modules/nos-gallery status --short 2>$null
  if ($sub) { $v.Add("nos-gallery submodule dirty") }
} catch { $v.Add("repository inspection failed") }

if ($v.Count -gt 0) {
  @{ decision = "continue"; reason = "Repository gate failed: " + ($v -join "; ") } | ConvertTo-Json -Compress
} else {
  @{ decision = "allow"; reason = "Repository gate clean." } | ConvertTo-Json -Compress
}
