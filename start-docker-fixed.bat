@echo off
echo ========================================
echo    Start Docker Fixed (Nginx SSL Fixed)
========================================
echo.

echo Stopping existing containers...
docker-compose down

echo.
echo Starting Docker containers...
docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ERROR: Docker build failed!
    echo.
    echo Checking Docker logs...
    docker-compose logs
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Docker Started Successfully!
========================================
echo.
echo Waiting for containers to start...
timeout /t 45 /nobreak >nul

echo.
echo Checking container status...
docker ps

echo.
echo ========================================
echo    Application URLs
========================================
echo.
echo Frontend: http://localhost:3011
echo Backend:  http://localhost:3101
echo MySQL:    localhost:3306
echo Nginx:    http://localhost:80
echo.
echo Containers should now appear in Docker Desktop!
echo.
pause
