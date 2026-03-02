@echo off
echo ========================================
echo Quick Start - Medicart Microservices
echo ========================================
echo.

cd /d "%~dp0"

echo Starting Eureka Server...
start "Eureka Server" cmd /k "cd microservices\eureka-server && mvn spring-boot:run"
timeout /t 25 /nobreak

echo Starting API Gateway...
start "API Gateway" cmd /k "cd microservices\api-gateway && mvn spring-boot:run"
timeout /t 15 /nobreak

echo Starting all other services...
start "Auth Service" cmd /k "cd microservices\auth-service && mvn spring-boot:run"
start "Admin Catalogue" cmd /k "cd microservices\admin-catalogue-service && mvn spring-boot:run"
start "Cart Orders" cmd /k "cd microservices\cart-orders-service && mvn spring-boot:run"
start "Payment Service" cmd /k "cd microservices\payment-service && mvn spring-boot:run"
start "Analytics Service" cmd /k "cd microservices\analytics-service && mvn spring-boot:run"

timeout /t 5 /nobreak

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo All services are starting!
echo Check individual windows for status.
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Gateway:  http://localhost:8080
echo Eureka:   http://localhost:8761
echo.
