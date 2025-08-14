@echo off
echo ========================================
echo Restarting Backend Server
echo ========================================

echo.
echo [1/3] Stopping existing backend processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo [2/3] Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run start"

echo.
echo [3/3] Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo ✅ Backend server restarted!
echo ========================================
echo Backend: http://192.168.0.94:3102
echo Rate limiting: Increased to 1000 requests/15min
echo ========================================
echo.
pause
