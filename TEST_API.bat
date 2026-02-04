@echo off
REM Test API endpoint to verify medicines are returned
echo ========================================
echo Testing GET /medicines endpoint
echo ========================================
echo.
echo Requesting: http://localhost:8080/medicines
echo.
curl http://localhost:8080/medicines
echo.
echo ========================================
echo Test complete!
echo If you see JSON with medicines data above, the fix is successful!
echo ========================================
pause
