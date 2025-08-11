@echo off
echo Starting Frontend and Backend in PRODUCTION mode...
echo.

REM Set environment variables for production
set NODE_ENV=production

REM Start Backend in background
start "Backend Server (Prod)" cmd /k "cd backend && set NODE_ENV=production && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start Frontend in background
start "Frontend Server (Prod)" cmd /k "cd frontend && npm start"

echo Both servers are starting in PRODUCTION mode...
echo.
echo 🔧 Backend API: http://192.168.0.94:3101 (Network)
echo 🌐 Frontend: http://192.168.0.94:3011 (Network)
echo.
echo ✅ Production mode - using 192.168.0.94
echo.
echo Press any key to exit this window...
pause > nul