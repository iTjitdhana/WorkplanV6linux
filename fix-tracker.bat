@echo off
echo ========================================
echo Fixing Tracker Page Issues
echo ========================================

echo.
echo [1/4] Stopping all servers...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak > nul

echo.
echo [2/4] Building frontend with tracker fixes...
call build-simple.bat
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Starting backend...
cd backend
start "Backend Server" cmd /k "npm run start"

echo.
echo [4/4] Starting frontend...
timeout /t 5 /nobreak > nul
cd ..\frontend
start "Frontend Server" cmd /k "npm run start"

echo.
echo ========================================
echo ✅ Tracker page issues fixed!
echo ========================================
echo Changes made:
echo - Added proper error handling in tracker page
echo - Fixed process steps and logs loading
echo - Added try-catch blocks for API calls
echo - Improved error messages
echo ========================================
echo.
echo URLs:
echo Backend: http://192.168.0.94:3101
echo Frontend: http://192.168.0.94:3012
echo Tracker: http://192.168.0.94:3012/tracker
echo ========================================
echo.
pause
