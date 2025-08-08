@echo off
echo ========================================
echo Start Logs System with Docker
echo ========================================

echo.
echo 1. Stopping existing containers...
docker-compose down

echo.
echo 2. Building and starting containers...
docker-compose up -d backend frontend nginx

echo.
echo 3. Checking container status...
docker ps

echo.
echo ========================================
echo System Started!
echo ========================================
echo.
echo Access URLs:
echo Frontend: http://localhost
echo Backend API: http://localhost/api
echo Logs Page: http://localhost/logs
echo.
echo If you see any errors, run: .\fix-port-conflict.bat
echo.
pause
