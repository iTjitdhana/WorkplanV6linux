@echo off
echo ========================================
echo Starting WorkplanV6 on 192.168.0.94
echo ========================================

echo.
echo [1/3] Checking Docker status...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed or not running
    echo Please install Docker Desktop and start it
    pause
    exit /b 1
)
echo ✅ Docker is available

echo.
echo [2/3] Checking network connectivity...
ping -n 1 192.168.0.94 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cannot reach 192.168.0.94
    echo Please check your network connection
    pause
    exit /b 1
)
echo ✅ Network connectivity OK

echo.
echo [3/3] Starting Docker containers...
echo Using 192.168.0.94 configuration...
docker-compose up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start containers
    echo Checking container status...
    docker-compose ps
    pause
    exit /b 1
)

echo.
echo ========================================
echo System started successfully!
echo ========================================
echo.
echo 🌐 Frontend: http://192.168.0.94:3012
echo 🔧 Backend API: http://192.168.0.94:3102
echo 🗄️  Database: 192.168.0.94:3306
echo.
echo 📋 Useful commands:
echo   View logs: docker-compose logs -f
echo   Stop system: docker-compose down
echo   Restart: docker-compose restart
echo   Check status: docker-compose ps
echo.
echo 🚀 System is ready to use!
echo.
pause
