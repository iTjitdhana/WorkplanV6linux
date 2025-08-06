@echo off
echo Starting Production Servers
echo ===========================
echo.

echo Checking system status...

REM Check if backend directory exists
if not exist "backend" (
    echo ✗ Backend directory not found
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "frontend" (
    echo ✗ Frontend directory not found
    pause
    exit /b 1
)

REM Check if frontend is built
if not exist "frontend\.next" (
    echo ⚠ Frontend not built. Building now...
    cd frontend
    call npm run build
    cd ..
)

echo.
echo 🚀 Starting Production Servers...
echo.

REM Start Backend
echo Starting Backend Server...
start "Backend Server - Production" cmd /k "cd backend && echo Backend Server Starting... && npm start"

REM Wait for backend to start
echo Waiting for Backend to start...
timeout /t 5 /nobreak > nul

REM Start Frontend
echo Starting Frontend Server...
start "Frontend Server - Production" cmd /k "cd frontend && echo Frontend Server Starting... && npm start"

REM Wait for frontend to start
echo Waiting for Frontend to start...
timeout /t 8 /nobreak > nul

echo.
echo 🎉 Production Servers Started!
echo ==============================
echo.

echo Server Status:
echo ✓ Backend: http://localhost:3101
echo ✓ Frontend: http://localhost:3011
echo.

echo 🟢 System is operational
echo.
echo You can now access the application at:
echo http://localhost:3011
echo.

set /p openBrowser=Open in browser? (y/n): 

if /i "%openBrowser%"=="y" (
    start http://localhost:3011
)

echo.
echo To stop servers, close their console windows
echo To restart, run this script again
echo.

pause