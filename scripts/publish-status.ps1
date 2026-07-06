$ErrorActionPreference = "Stop"

# Paths
$repoPath = "C:\repos\vm-status"
$sourceJson = "C:\VM-Monitor\state-public.json"
$targetJson = "$repoPath\state-public.json"

cd $repoPath

# Copy latest heartbeat JSON into repo
Copy-Item $sourceJson $targetJson -Force

# Check if anything actually changed
git add state-public.json

$status = git status --porcelain

if (-not $status) {
    Write-Host "No changes detected. Nothing to commit."
    exit 0
}

# Commit + push
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

git commit -m "Heartbeat update $timestamp"
git push origin main

Write-Host "Published heartbeat update."