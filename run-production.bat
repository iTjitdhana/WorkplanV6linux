@echo off
echo ========================================
echo Running WorkplanV6 Production Mode
echo ========================================

echo.
echo [1/3] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run start"

echo.
echo [2/3] Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo [3/3] Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run start"

echo.
echo ========================================
echo Production servers started!
echo ========================================
echo Backend: http://192.168.0.94:3101
echo Frontend: http://192.168.0.94:3011
echo ========================================
echo.
echo Note: Make sure you have built the frontend first!
echo If not, run: build-simple.bat
echo.
pause
