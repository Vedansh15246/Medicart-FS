@echo off
echo ========================================
echo Stopping All Medicart Services
echo ========================================
echo.

echo Stopping Java processes (microservices)...
taskkill /FI "WINDOWTITLE eq Eureka Server*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq API Gateway*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Auth Service*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Admin Catalogue*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Cart Orders*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Payment Service*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Analytics Service*" /T /F 2>nul

echo Stopping Frontend...
taskkill /FI "WINDOWTITLE eq Frontend*" /T /F 2>nul

echo.
echo All services stopped!
echo.
pause
