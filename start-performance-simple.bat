@echo off
echo ========================================
echo    WorkplanV6 Simple Performance Mode
echo ========================================
echo.

echo Starting services with basic performance optimizations...
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r /c:"IPv4 Address"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%

echo Your local IP address: %LOCAL_IP%
echo.

REM Start backend with performance settings
echo Starting Backend (Performance Mode)...
cd backend
start "Backend Performance" cmd /k "set NODE_ENV=production && set NODE_OPTIONS=--max-old-space-size=512 && npm start"
cd ..

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend with performance settings
echo Starting Frontend (Performance Mode)...
cd frontend
start "Frontend Performance" cmd /k "set NODE_ENV=production && set NODE_OPTIONS=--max-old-space-size=512 && npm run dev"
cd ..

echo.
echo ========================================
echo    Simple Performance Mode Started!
echo ========================================
echo.
echo Local access:
echo Frontend: http://localhost:3011
echo Backend:  http://localhost:3101
echo.
echo Network access:
echo Frontend: http://%LOCAL_IP%:3011
echo Backend:  http://%LOCAL_IP%:3101
echo.
echo Performance optimizations enabled:
echo - Memory optimization
echo - Production mode
echo - Node.js optimizations
echo - Network access enabled
echo.
echo Press any key to open the application...
pause >nul
start http://localhost:3011
