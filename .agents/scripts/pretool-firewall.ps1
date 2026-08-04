$raw = [Console]::In.ReadToEnd()
try { $p = $raw | ConvertFrom-Json -Depth 30 }
catch {
  @{ decision = "force_ask"; reason = "Could not parse hook payload." } | ConvertTo-Json -Compress
  exit 0
}
$name = [string]$p.toolCall.name
$args = $p.toolCall.args | ConvertTo-Json -Depth 30 -Compress

$blockedCommands = @(
  '(?i)\bgit\s+commit\b','(?i)\bgit\s+push\b','(?i)\bgit\s+reset\b',
  '(?i)\bgit\s+rebase\b','(?i)\bgit\s+merge\b','(?i)\bgit\s+revert\b',
  '(?i)\bgit\s+clean\b','(?i)\bgit\s+cherry-pick\b'
)
$protectedPaths = @(
  '(?i)apps[\\/]+storefront[\\/]+src[\\/]+app[\\/]+globals\.css',
  '(?i)pnpm-lock\.yaml','(?i)package\.json','(?i)\.github[\\/]+workflows',
  '(?i)playwright\.config','(?i)apps[\\/]+storefront[\\/]+src[\\/]+modules[\\/]+nos-gallery'
)

foreach ($x in $blockedCommands) {
  if ($args -match $x) {
    @{ decision = "deny"; reason = "Blocked unauthorized Git history or remote operation." } | ConvertTo-Json -Compress
    exit 0
  }
}
foreach ($x in $protectedPaths) {
  if ($args -match $x -and $name -match 'write|replace|run_command') {
    @{ decision = "force_ask"; reason = "Protected path requires explicit user approval." } | ConvertTo-Json -Compress
    exit 0
  }
}
@{ decision = "allow"; reason = "Allowed by Fio Vivo firewall." } | ConvertTo-Json -Compress
