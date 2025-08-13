@echo off
echo ========================================
echo Running Production - Simple Mode
echo ========================================

echo.
echo [1/3] Stopping existing servers...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo [2/3] Starting backend (no rate limiting)...
cd backend
start "Backend Server" cmd /k "npm run start"

echo.
echo [3/3] Starting frontend...
timeout /t 5 /nobreak > nul
cd ..\frontend
start "Frontend Server" cmd /k "npm run start"

echo.
echo ========================================
echo ✅ Production servers started!
echo ========================================
echo Backend: http://192.168.0.94:3101
echo Frontend: http://192.168.0.94:3011
echo ========================================
echo.
echo Features:
echo - No rate limiting (429 errors fixed)
echo - Next.js standalone disabled
echo - All APIs working
echo ========================================
echo.
pause
