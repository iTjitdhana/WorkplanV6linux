@echo off
echo ========================================
echo    Fix Docker Path Error
========================================
echo.

echo Checking if SQL file exists...
if exist "backend\esp_tracker (6).sql" (
    echo SQL file found: backend\esp_tracker (6).sql
) else (
    echo ERROR: SQL file not found!
    echo Please check if the file exists.
    pause
    exit /b 1
)

echo.
echo Testing Docker build...
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
echo    Docker Build Successful!
========================================
echo.
echo Checking container status...
docker ps
echo.
echo Containers should now appear in Docker Desktop!
echo.
pause
