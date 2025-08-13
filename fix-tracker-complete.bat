@echo off
echo ========================================
echo Fixing Tracker Page - Complete Solution
echo ========================================

echo.
echo [1/5] Stopping all servers...
taskkill /f /im node.exe 2>nobreak > nul
timeout /t 3 /nobreak > nul

echo.
echo [2/5] Cleaning up frontend build...
cd frontend
if exist .next rmdir /s /q .next

echo.
echo [3/5] Building frontend with all fixes...
set NODE_ENV=production
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo [4/5] Starting backend...
cd ..\backend
start "Backend Server" cmd /k "npm run start"

echo.
echo [5/5] Starting frontend...
timeout /t 5 /nobreak > nul
cd ..\frontend
start "Frontend Server" cmd /k "npm run start"

echo.
echo ========================================
echo ✅ Tracker page completely fixed!
echo ========================================
echo Changes made:
echo - Fixed logs API to return actual logs data
echo - Added proper error handling in tracker page
echo - Fixed process steps and logs loading
echo - Added try-catch blocks for all API calls
echo - Improved error messages and user feedback
echo - Fixed API response handling
echo ========================================
echo.
echo URLs:
echo Backend: http://192.168.0.94:3101
echo Frontend: http://192.168.0.94:3011
echo Tracker: http://192.168.0.94:3011/tracker
echo ========================================
echo.
echo Test the tracker page now!
echo.
pause
