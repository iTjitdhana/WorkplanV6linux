@echo off
echo Starting Production Planning System on IP 192.168.0.94
echo Backend will run on port 3101
echo Frontend will run on port 3011
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://192.168.0.94:3101
echo Frontend: http://192.168.0.94:3011
echo.
echo Press any key to close this window...
pause > nul 