@echo off
chcp 65001 >nul
echo Starting Production System
echo ========================

echo Step 1: Stopping existing processes...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Stopped existing Node.js processes

echo.
echo Step 2: Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo Waiting for Backend to start...
timeout /t 5 /nobreak >nul

echo Step 3: Starting Frontend Server (Production Mode)...
cd ..\frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ Production servers started!
echo 🌐 Frontend: http://localhost:3011
echo 🔧 Backend: http://localhost:3101
echo Wait 30 seconds for servers to fully start

pause