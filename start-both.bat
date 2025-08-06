@echo off
echo Starting Frontend and Backend...

REM Start Backend in background
start "Backend Server" cmd /k "cd backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start Frontend in background
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Both servers are starting...
echo.
echo 🔧 Backend API: http://localhost:3101 (Local)
echo 🔧 Backend API: http://192.168.0.94:3101 (Network)
echo.
echo 🌐 Frontend: http://localhost:3011 (Local)
echo 🌐 Frontend: http://192.168.0.94:3011 (Network)
echo.
echo ✅ All devices on network can now access: http://192.168.0.94:3011
echo.
echo Press any key to exit this window...
pause > nul 