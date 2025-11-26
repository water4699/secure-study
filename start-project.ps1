# Encrypted Study Tracker - Quick Start Script
# This script helps you start the entire project quickly

Write-Host "=== Encrypted Study Tracker - Quick Start ===" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: Not in the secure-study directory. Please run this script from the secure-study folder." -ForegroundColor Red
    exit 1
}

Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
cd frontend
npm install
cd ..

Write-Host "Starting Hardhat node in background..." -ForegroundColor Yellow
Start-Job -ScriptBlock {
    cd "secure-study"
    npx hardhat node
} | Out-Null

Write-Host "Waiting for Hardhat node to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Deploying contracts..." -ForegroundColor Yellow
npx hardhat deploy --network localhost

Write-Host "Generating ABI files..." -ForegroundColor Yellow
cd frontend
node scripts/genabi.mjs
cd ..

Write-Host "Starting frontend development server..." -ForegroundColor Yellow
cd frontend
Start-Job -ScriptBlock {
    npm run dev
} | Out-Null

Write-Host ""
Write-Host "=== Project Started Successfully! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Services running:" -ForegroundColor Cyan
Write-Host "- Hardhat Node: http://localhost:8545" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "To interact with the contract, you can use:" -ForegroundColor Cyan
Write-Host "- Frontend UI at http://localhost:3000" -ForegroundColor White
Write-Host "- Hardhat tasks: npx hardhat task:study-* --help" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Stopping services..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
}
