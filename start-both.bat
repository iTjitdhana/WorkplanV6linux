@echo off
echo Starting Frontend and Backend...
echo.
echo Choose mode:
echo 1. Development (localhost)
echo 2. Production (192.168.0.94)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    echo Starting in DEVELOPMENT mode...
    call start-dev.bat
) else if "%choice%"=="2" (
    echo Starting in PRODUCTION mode...
    call start-production.bat
) else (
    echo Invalid choice. Starting in DEVELOPMENT mode...
    call start-dev.bat
) 