@echo off
chcp 65001 >nul
echo Quick Start System
echo ==================

echo Step 1: Starting Backend...
cd backend
start "Backend Server" cmd /k "npm start"

echo Waiting for Backend to start...
timeout /t 5 /nobreak >nul

echo Step 2: Starting Frontend...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Backend: http://localhost:3101
echo Frontend: http://localhost:3011
echo Wait 30 seconds for servers to fully start
echo Then try the Sync function again

pause 