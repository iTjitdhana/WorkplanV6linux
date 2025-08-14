@echo off
echo ========================================
echo Starting WorkplanV6 Production Mode
echo ========================================

echo.
echo [1/4] Building Frontend for Production...
call build-simple.bat
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend build completed!

echo.
echo [2/4] Starting Backend Server...
cd ..\backend
start "Backend Server" cmd /k "npm run start"

echo.
echo [3/4] Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo [4/4] Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run start"

echo.
echo ========================================
echo Production servers started!
echo ========================================
echo Backend: http://192.168.0.94:3102
echo Frontend: http://192.168.0.94:3012
echo ========================================
echo.
echo Press any key to exit...
pause > nul
