#!/usr/bin/env powershell
# Medicart Logging Test Script

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   MEDICART COMPREHENSIVE LOGGING" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if services are running
Write-Host "🔍 Checking service status..." -ForegroundColor Yellow

$services = @(
    @{ Name = "Eureka"; Port = 8761 },
    @{ Name = "auth-service"; Port = 8081 },
    @{ Name = "admin-catalogue"; Port = 8082 },
    @{ Name = "api-gateway"; Port = 8080 }
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)/actuator/health" -ErrorAction SilentlyContinue -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name) (port $($service.Port)): RUNNING" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ $($service.Name) (port $($service.Port)): NOT RUNNING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Log File Locations:" -ForegroundColor Cyan
Write-Host "  Auth Service: microservices/auth-service/logs/auth-service.log" -ForegroundColor Gray
Write-Host "  Admin Catalogue: microservices/admin-catalogue-service/logs/admin-catalogue-service.log" -ForegroundColor Gray
Write-Host ""

Write-Host "🌐 Testing Prescription Endpoint:" -ForegroundColor Cyan
Write-Host "  Command: curl -X GET http://localhost:8080/api/prescriptions -H 'Authorization: Bearer YOUR_TOKEN' -H 'X-User-Id: 1'" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 Testing Product Fetch:" -ForegroundColor Cyan
Write-Host "  Command: curl -X GET http://localhost:8080/medicines" -ForegroundColor Gray
Write-Host ""

Write-Host "🔧 To View Logs:" -ForegroundColor Cyan
Write-Host "  Auth logs: Get-Content 'microservices\auth-service\logs\auth-service.log' -Tail 50" -ForegroundColor Gray
Write-Host "  Catalogue logs: Get-Content 'microservices\admin-catalogue-service\logs\admin-catalogue-service.log' -Tail 50" -ForegroundColor Gray
Write-Host ""

Write-Host "💾 Frontend Logs (Browser Console):" -ForegroundColor Cyan
Write-Host "  Press F12 → Console tab" -ForegroundColor Gray
Write-Host "  Look for: 📋 🌐 ✅ ❌ 📦 📊 markers" -ForegroundColor Gray
Write-Host ""

Write-Host "📥 Export Frontend Logs:" -ForegroundColor Cyan
Write-Host "  1. Open browser console (F12)" -ForegroundColor Gray
Write-Host "  2. Run: logger.downloadLogs()" -ForegroundColor Gray
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Ready for comprehensive analysis!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
