$ErrorActionPreference="Stop"
$Body=@{
  model="gpt-oss:20b"
  messages=@(@{role="user";content="Reply with exactly GREEN"})
  stream=$false
  think="low"
}|ConvertTo-Json -Depth 8
$r=Invoke-RestMethod -Uri "http://localhost:11434/api/chat" -Method Post -ContentType "application/json" -Body $Body
$r.message.content
