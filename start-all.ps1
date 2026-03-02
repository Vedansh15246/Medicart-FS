# Start all Medicart microservices and frontend
Write-Host "========================================"
Write-Host "Starting Medicart Microservices"
Write-Host "========================================"
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "[1/9] Starting Eureka Server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\microservices\eureka-server'; mvn spring-boot:run"
Start-Sleep -Seconds 30

Write-Host "[2/9] Starting API Gateway..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\microservices\api-gateway'; mvn spring-boot:run"
Start-Sleep -Seconds 20

Write-Host "[3/9] Starting Auth Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\microservices\auth-service'; mvn spring-boot:run"
Start-Sleep -Seconds 10

Write-Host "[4/9] Starting Admin Catalogue Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\microservices\admin-catalogue-service'; mvn spring-boot:run"
Start-Sleep -Seconds 10

Write-Host "[5/9] Starting Cart Orders Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\microservices\cart-orders-service'; mvn spring-boot:run"
Start-Sleep -Seconds 10

Write-Host "[6/9] Starting Payment Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\microservices\payment-service'; mvn spring-boot:run"
Start-Sleep -Seconds 10

Write-Host "[7/9] Starting Analytics Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\microservices\analytics-service'; mvn spring-boot:run"
Start-Sleep -Seconds 10

Write-Host "[8/9] Checking Frontend Dependencies..."
if (-Not (Test-Path "$scriptPath\frontend\node_modules")) {
    Write-Host "Installing npm packages..."
    Set-Location "$scriptPath\frontend"
    npm install
    Set-Location $scriptPath
}

Write-Host "[9/9] Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; npm run dev"

Write-Host ""
Write-Host "========================================"
Write-Host "All services are starting!"
Write-Host "========================================"
Write-Host ""
Write-Host "Service URLs:"
Write-Host "- Eureka Server:    http://localhost:8761"
Write-Host "- API Gateway:      http://localhost:8080"
Write-Host "- Auth Service:     http://localhost:8081"
Write-Host "- Catalogue:        http://localhost:8082"
Write-Host "- Cart/Orders:      http://localhost:8083"
Write-Host "- Payment:          http://localhost:8084"
Write-Host "- Analytics:        http://localhost:8085"
Write-Host "- Frontend:         http://localhost:5173"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
