@echo off
echo ========================================
echo    WorkplanV6 Docker Deployment
echo ========================================
echo.

echo Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running!
    echo Please install Docker Desktop for Windows
    echo Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo Docker is available!
echo.

echo Building and starting containers...
echo This may take a few minutes on first run...
echo.

docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start containers!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Deployment Successful!
echo ========================================
echo.
echo Services are starting up...
echo.
echo Frontend: http://localhost:3011
echo Backend:  http://localhost:3101
echo MySQL:    localhost:3306
echo.
echo To view logs:
echo   docker-compose logs -f
echo.
echo To stop services:
echo   docker-compose down
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:3011
