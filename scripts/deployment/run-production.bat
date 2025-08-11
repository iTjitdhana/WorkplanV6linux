@echo off
chcp 65001 >nul
echo Production System - All in One
echo =============================

echo Step 1: Stopping existing processes...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Stopped existing Node.js processes

echo.
echo Step 2: Installing dependencies...
cd frontend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Step 3: Building Frontend for Production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)

cd ..
echo ✅ Frontend built successfully!

echo.
echo Step 4: Installing Backend dependencies...
cd backend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✅ Backend dependencies installed!

echo.
echo Step 5: Starting Production Servers...
cd ..
echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo Waiting for Backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server (Production Mode)...
cd ..\frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo 🎉 Production system started successfully!
echo 🌐 Frontend: http://localhost:3011
echo 🔧 Backend: http://localhost:3101
echo Wait 30 seconds for servers to fully start

pause 