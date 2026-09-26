# Downloads the tech-stack icons used by README.md into assets/icons (idempotent).
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$out  = Join-Path $root 'assets/icons'
New-Item -ItemType Directory -Force $out | Out-Null

$devicon = @{
  'csharp'='csharp'; 'dot-net'='dot-net'; 'dotnetcore'='dotnetcore'; 'go'='go'; 'python'='python';
  'typescript'='typescript'; 'javascript'='javascript'; 'react'='react'; 'nextjs'='nextjs';
  'postgresql'='postgresql'; 'microsoftsqlserver'='microsoftsqlserver'; 'sqlite'='sqlite'; 'redis'='redis';
  'rabbitmq'='rabbitmq'; 'apachekafka'='apachekafka'; 'grpc'='grpc'; 'docker'='docker'; 'kubernetes'='kubernetes';
  'nginx'='nginx'; 'git'='git'; 'gitlab'='gitlab'; 'github'='github'; 'githubactions'='githubactions';
  'linux'='linux'; 'grafana'='grafana'; 'prometheus'='prometheus'; 'opentelemetry'='opentelemetry';
  'pytorch'='pytorch'; 'tailwindcss'='tailwindcss'; 'vitejs'='vitejs'; 'threejs'='threejs'; 'blazor'='blazor';
  'azure'='azure'; 'ubuntu'='ubuntu'; 'bash'='bash'; 'cplusplus'='cplusplus'
}
foreach ($k in $devicon.Keys) {
  $n = $devicon[$k]
  $url = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/$n/$n-original.svg"
  $dest = Join-Path $out "$k.svg"
  try { Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing; Write-Host "ok  $k" }
  catch { Write-Host "ERR $k  $url"; if (Test-Path $dest) { Remove-Item $dest } }
}

# simple-icons are monochrome; we recolor with the brand color.
$simple = @{ 'qdrant'='#DC244C'; 'ollama'='#FFFFFF'; 'openiddict'=$null; 'minio'='#C72E49'; 'redpanda'='#E4202F'; 'scalar'='#1A1A1A' }
foreach ($k in $simple.Keys) {
  $url = "https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/$k.svg"
  $dest = Join-Path $out "$k.svg"
  try {
    $svg = (Invoke-WebRequest -Uri $url -UseBasicParsing).Content
    if ($simple[$k]) { $svg = $svg -replace '<svg ', "<svg fill=`"$($simple[$k])`" " }
    Set-Content -Path $dest -Value $svg -NoNewline
    Write-Host "ok  $k (simple-icons)"
  } catch { Write-Host "ERR $k  $url" }
}
