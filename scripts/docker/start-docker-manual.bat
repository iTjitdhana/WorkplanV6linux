@echo off
echo ========================================
echo    Manual Docker Start
echo ========================================
echo.

echo This will start Docker containers manually...
echo.

REM Stop any existing containers
echo Stopping existing containers...
docker-compose down
echo.

REM Remove old images
echo Removing old images...
docker rmi workplan_backend workplan_frontend 2>nul
echo.

REM Build and start containers
echo Building and starting containers...
docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start containers!
    echo.
    echo Checking logs...
    docker-compose logs
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Docker Containers Started!
echo ========================================
echo.
echo Checking container status...
docker ps
echo.
echo.
echo Services should now appear in Docker Desktop:
echo - workplan_mysql (MySQL Database)
echo - workplan_backend (Backend API)
echo - workplan_frontend (Frontend App)
echo - workplan_nginx (Nginx Proxy)
echo.
echo Access URLs:
echo Frontend: http://localhost:3011
echo Backend:  http://localhost:3101
echo MySQL:    localhost:3306
echo Nginx:    http://localhost:80
echo.
echo To view logs:
echo   docker-compose logs -f
echo.
echo To stop containers:
echo   docker-compose down
echo.
pause
