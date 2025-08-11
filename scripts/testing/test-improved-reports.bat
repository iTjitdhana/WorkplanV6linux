@echo off
echo ========================================
echo Testing Improved Reports System
echo ========================================

echo.
echo 1. Starting backend server (if not running)...
start /B "Backend Server" cmd /c "cd backend && npm start"

echo.
echo 2. Waiting for server to start...
timeout /t 5 /nobreak > nul

echo.
echo 3. Running improved reports test...
node test-improved-reports.js

echo.
echo 4. Test completed. Check the output above for results.
echo.
echo ========================================
echo Additional manual tests you can run:
echo ========================================
echo.
echo Open browser and test these URLs:
echo http://localhost:3000/reports
echo.
echo Or test API directly:
echo curl "http://localhost:3001/api/reports/production-analysis?limit=10000"
echo curl "http://localhost:3001/api/reports/production-analysis?start_date=2024-01-01&end_date=2024-12-31"
echo.
pause