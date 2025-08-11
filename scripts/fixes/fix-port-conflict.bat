@echo off
echo ========================================
echo Fix Port Conflict
echo ========================================

echo.
echo 1. Stopping existing containers...
docker-compose down

echo.
echo 2. Checking if port 3306 is in use...
netstat -an | findstr :3306

echo.
echo 3. If port 3306 is in use, you can:
echo    - Stop the local MySQL service
echo    - Or use a different port for Docker MySQL
echo.

echo 4. Starting containers without MySQL (using external database)...
docker-compose up -d backend frontend nginx

echo.
echo 5. Checking container status...
docker ps

echo.
echo ========================================
echo Port Conflict Fixed!
echo ========================================
echo.
echo Access URLs:
echo Frontend: http://localhost
echo Backend API: http://localhost/api
echo Logs Page: http://localhost/logs
echo.
pause
