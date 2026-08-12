$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Test-Path ".\pollr.local.db")) {
  ..\.venv\Scripts\python.exe scripts\init_sqlite.py
}

$env:DATABASE_URL = "sqlite+aiosqlite:///./pollr.local.db"
..\.venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000
