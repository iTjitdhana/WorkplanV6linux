@echo off
echo ========================================
echo Test Logs Summary System
echo ========================================

echo.
echo Testing API endpoints...

echo.
echo 1. Testing /api/logs (original logs endpoint)
curl -s http://localhost:3011/api/logs | head -c 200
echo ...

echo.
echo 2. Testing /api/logs/summary (new summary endpoint)
curl -s http://localhost:3011/api/logs/summary | head -c 200
echo ...

echo.
echo ========================================
echo Summary:
echo - /api/logs: Returns individual log entries
echo - /api/logs/summary: Returns work plans with log counts
echo ========================================

echo.
echo Check the logs page at: http://localhost:3011/logs
echo The summary tab should now show correct job counts without duplicates
echo.

pause
