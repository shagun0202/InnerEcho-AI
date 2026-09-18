param([int]$Port = 8000)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$candidates = @(
    (Join-Path $projectRoot '.venv/Scripts/python.exe'),
    (Join-Path (Split-Path $projectRoot -Parent) '.venv/Scripts/python.exe')
)
$taskPython = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $taskPython) { throw 'Create a Python 3.12 virtual environment using the README setup first.' }
Push-Location (Join-Path $projectRoot 'Backend')
try { & $taskPython -m uvicorn app.main:app --host 127.0.0.1 --port $Port --reload }
finally { Pop-Location }
