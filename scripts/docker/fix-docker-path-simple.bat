@echo off
echo ========================================
echo    Fix Docker Path Error
========================================
echo.

echo Checking if SQL file exists...
if exist "database\sql\esp_tracker (6).sql" (
    echo SQL file found: database\sql\esp_tracker (6).sql
) else (
    echo SQL file not found in database\sql.
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
