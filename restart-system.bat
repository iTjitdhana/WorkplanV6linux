@echo off
echo ========================================
echo 🔄 Restarting Production Planning System
echo ========================================

echo.
echo 🛑 Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Starting Backend...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Starting Frontend...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ System restart completed!
echo.
echo 📱 Backend: http://localhost:3101
echo 🌐 Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul 