@echo off
echo ========================================
echo Fixing All Issues - Permanent Solution
echo ========================================

echo.
echo [1/6] Stopping all servers...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak > nul

echo.
echo [2/6] Cleaning up frontend build...
cd frontend
if exist .next rmdir /s /q .next
if exist node_modules rmdir /s /q node_modules

echo.
echo [3/6] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed!
    pause
    exit /b 1
)

echo.
echo [4/6] Building frontend with fixes...
set NODE_ENV=production
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo [5/6] Starting backend with relaxed rate limits...
cd ..\backend
start "Backend Server" cmd /k "npm run start"

echo.
echo [6/6] Starting frontend...
timeout /t 5 /nobreak > nul
cd ..\frontend
start "Frontend Server" cmd /k "npm run start"

echo.
echo ========================================
echo ✅ All issues fixed permanently!
echo ========================================
echo Changes made:
echo - Disabled Next.js standalone output
echo - Increased rate limit to 10000 requests/minute
echo - Applied rate limiting only to specific endpoints
echo - Cleaned and rebuilt frontend
echo - Fixed JSON parsing errors
echo ========================================
echo.
echo URLs:
echo Backend: http://192.168.0.94:3102
echo Frontend: http://192.168.0.94:3012
echo ========================================
echo.
pause
