@echo off
echo ========================================
echo Disabling Rate Limiting Completely
echo ========================================

echo.
echo [1/3] Stopping backend server...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo [2/3] Commenting out rate limiting in server.js...
cd backend
powershell -Command "(Get-Content server.js) -replace '// Apply rate limiting only to specific endpoints that need protection', '// Rate limiting disabled for development' | Set-Content server.js"
powershell -Command "(Get-Content server.js) -replace 'app.use.*limiter\);', '// app.use.*limiter); // Disabled' | Set-Content server.js"

echo.
echo [3/3] Starting backend without rate limiting...
start "Backend Server" cmd /k "npm run start"

echo.
echo ========================================
echo ✅ Rate limiting completely disabled!
echo ========================================
echo Backend: http://192.168.0.94:3101
echo No more 429 errors!
echo ========================================
echo.
pause
