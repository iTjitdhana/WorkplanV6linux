@echo off
echo ========================================
echo    Start Docker Clean Build
========================================
echo.

echo Starting Docker with clean build...
echo.

echo 1. Stopping existing containers...
docker-compose down

echo.
echo 2. Cleaning Docker cache...
docker system prune -f

echo.
echo 3. Building and starting containers...
docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ERROR: Docker build failed!
    echo.
    echo Trying alternative approach...
    echo.
    echo 4. Building without cache...
    docker-compose build --no-cache
    echo.
    echo 5. Starting containers...
    docker-compose up -d
)

echo.
echo ========================================
echo    Docker Status
========================================
echo.
docker-compose ps

echo.
echo ========================================
echo    Access URLs
========================================
echo.
echo Frontend: http://localhost
echo Backend API: http://localhost/api
echo.
echo If containers are not running, try:
echo .\fix-docker-build.bat
echo.
pause
