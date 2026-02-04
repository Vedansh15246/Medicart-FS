@echo off
REM Execute SQL seed script
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pshahid admin_catalogue_db < "c:\Users\2460603\OneDrive - Cognizant\Desktop\Project work\SEED_DATA_FIX.sql"
echo.
echo Data insertion completed!
pause
