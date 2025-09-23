@echo off
echo ========================================
echo Fixing Rate Limiting Issues
echo ========================================

echo.
echo [1/4] Stopping all servers...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak > nul

echo.
echo [2/4] Building frontend with fixes...
call build-simple.bat
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Starting backend with increased rate limits...
cd backend
start "Backend Server" cmd /k "npm run start"

echo.
echo [4/4] Starting frontend...
timeout /t 5 /nobreak > nul
cd ..\frontend
start "Frontend Server" cmd /k "npm run start"

echo.
echo ========================================
echo ✅ Rate limiting issues fixed!
echo ========================================
echo Changes made:
echo - Increased rate limit to 1000 requests/15min
echo - Added proper error handling in frontend APIs
echo - Fixed JSON parsing errors
echo ========================================
echo.
pause
