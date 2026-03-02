@echo off
echo ========================================
echo Starting Medicart Microservices
echo ========================================
echo.

cd /d "%~dp0"

echo [1/9] Starting Eureka Server...
start "Eureka Server" cmd /k "cd microservices\eureka-server && mvn spring-boot:run"
timeout /t 30 /nobreak

echo [2/9] Starting API Gateway...
start "API Gateway" cmd /k "cd microservices\api-gateway && mvn spring-boot:run"
timeout /t 20 /nobreak

echo [3/9] Starting Auth Service...
start "Auth Service" cmd /k "cd microservices\auth-service && mvn spring-boot:run"
timeout /t 10 /nobreak

echo [4/9] Starting Admin Catalogue Service...
start "Admin Catalogue Service" cmd /k "cd microservices\admin-catalogue-service && mvn spring-boot:run"
timeout /t 10 /nobreak

echo [5/9] Starting Cart Orders Service...
start "Cart Orders Service" cmd /k "cd microservices\cart-orders-service && mvn spring-boot:run"
timeout /t 10 /nobreak

echo [6/9] Starting Payment Service...
start "Payment Service" cmd /k "cd microservices\payment-service && mvn spring-boot:run"
timeout /t 10 /nobreak

echo [7/9] Starting Analytics Service...
start "Analytics Service" cmd /k "cd microservices\analytics-service && mvn spring-boot:run"
timeout /t 10 /nobreak

echo [8/9] Installing Frontend Dependencies...
cd frontend
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
)

echo [9/9] Starting Frontend...
start "Frontend" cmd /k "npm run dev"

cd ..

echo.
echo ========================================
echo All services are starting!
echo ========================================
echo.
echo Service URLs:
echo - Eureka Server:    http://localhost:8761
echo - API Gateway:      http://localhost:8080
echo - Auth Service:     http://localhost:8081
echo - Catalogue:        http://localhost:8082
echo - Cart/Orders:      http://localhost:8083
echo - Payment:          http://localhost:8084
echo - Analytics:        http://localhost:8085
echo - Frontend:         http://localhost:5173
echo.
echo Press any key to exit...
pause >nul
