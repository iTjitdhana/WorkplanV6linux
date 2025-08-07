@echo off
echo ========================================
echo    WorkplanV6 Simple Mode
echo ========================================
echo.

echo Starting services in simple mode...
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

REM Start backend
echo Starting Backend...
cd backend
start "Backend" cmd /k "npm start"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting Frontend...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo    Simple Mode Started!
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
echo Press any key to open the application...
pause >nul
start http://localhost:3011
