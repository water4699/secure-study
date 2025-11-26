# 启动开发环境的PowerShell脚本
Write-Host "🚀 Starting Encrypted Study Tracker Development Environment" -ForegroundColor Green

# 检查端口8545是否被占用
$port8545 = netstat -ano | findstr 8545
if ($port8545) {
    Write-Host "❌ Port 8545 is already in use. Stopping existing processes..." -ForegroundColor Red
    $processIds = $port8545 | ForEach-Object {
        if ($_ -match '(\d+)$') {
            $matches[1]
        }
    } | Select-Object -Unique

    foreach ($pid in $processIds) {
        if ($pid -and $pid -ne 0) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "   Stopped process $pid" -ForegroundColor Yellow
            } catch {
                Write-Host "   Could not stop process $pid" -ForegroundColor Yellow
            }
        }
    }

    # 等待一下确保端口释放
    Start-Sleep -Seconds 2
}

# 启动Hardhat节点
Write-Host "🔨 Starting Hardhat node..." -ForegroundColor Cyan
Start-Process -FilePath "npx" -ArgumentList "hardhat", "node" -NoNewWindow

# 等待Hardhat节点启动
Write-Host "⏳ Waiting for Hardhat node to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 部署合约
Write-Host "📦 Deploying contracts..." -ForegroundColor Cyan
try {
    & npx hardhat deploy --network localhost
    Write-Host "✅ Contracts deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Contract deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 生成ABI文件
Write-Host "📄 Generating ABI files..." -ForegroundColor Cyan
try {
    & node frontend/scripts/genabi.mjs
    Write-Host "✅ ABI files generated successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ ABI generation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 启动前端
Write-Host "🌐 Starting frontend development server..." -ForegroundColor Cyan
Write-Host "📱 Frontend will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "🔗 Make sure to connect MetaMask to localhost:8545 network" -ForegroundColor Yellow

Set-Location frontend
& npm run dev