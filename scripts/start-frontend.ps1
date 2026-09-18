param([int]$Port = 5173)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$taskNodeCommand = Get-Command node -ErrorAction SilentlyContinue
$taskNode = if ($taskNodeCommand) { $taskNodeCommand.Source } else {
    Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
}
if (-not (Test-Path -LiteralPath $taskNode)) { throw 'Install Node.js 22.12 or newer using the README setup first.' }
$frontendRoot = Join-Path $projectRoot 'Frontend/moodmentor-web'
if (-not (Test-Path -LiteralPath (Join-Path $frontendRoot 'node_modules/vite/bin/vite.js'))) {
    throw 'Install frontend dependencies with pnpm install --frozen-lockfile first.'
}
Push-Location $frontendRoot
try { & $taskNode node_modules/vite/bin/vite.js --host 127.0.0.1 --port $Port --strictPort }
finally { Pop-Location }
