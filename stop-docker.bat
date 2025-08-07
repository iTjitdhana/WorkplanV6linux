@echo off
echo ========================================
echo    Stopping WorkplanV6 Docker
echo ========================================
echo.

echo Stopping containers...
docker-compose down

if errorlevel 1 (
    echo.
    echo ERROR: Failed to stop containers!
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Containers Stopped Successfully!
echo ========================================
echo.
echo All WorkplanV6 services have been stopped.
echo.
echo To start again, run: start-docker.bat
echo.
pause
