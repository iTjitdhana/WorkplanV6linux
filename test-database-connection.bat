@echo off
echo ========================================
echo Test Database Connection
echo ========================================

echo.
echo Testing connection to MySQL database...
echo Host: 192.168.0.94
echo User: jitdhana
echo Database: esp_tracker_empty
echo.

echo 1. Testing API endpoint...
curl -X GET http://localhost:3011/api/logs

echo.
echo 2. If you see an error, please:
echo    - Make sure the database server is running
echo    - Check if the logs table exists
echo    - Verify the database credentials
echo.

echo 3. To create the logs table, run:
echo    .\create-logs-database.bat
echo.

echo 4. To restart the frontend server:
echo    cd frontend
echo    npm run dev
echo.

pause
