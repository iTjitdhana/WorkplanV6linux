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
call start-production.bat

echo.
echo 🎉 Production deployment completed!
echo 🌐 Frontend: http://localhost:3011
echo 🔧 Backend: http://localhost:3101

pause