@echo off
chcp 65001 >nul
echo Production Deployment System
echo ===========================

echo Step 1: Building for Production...
call build-production.bat
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo Step 2: Starting Production Servers...
if exist "start-production.bat" (
    call start-production.bat
) else (
    echo ⚠️ start-production.bat not found, starting servers manually...
    
    echo Starting Backend Server...
    cd backend
    start "Backend Server" cmd /k "npm start"
    
    echo Waiting for Backend to start...
    timeout /t 5 /nobreak >nul
    
    echo Starting Frontend Server (Production Mode)...
    cd ..\frontend
    start "Frontend Server" cmd /k "npm start"
)

echo.
echo 🎉 Production deployment completed!
echo 🌐 Frontend: http://localhost:3011
echo 🔧 Backend: http://localhost:3101

pause