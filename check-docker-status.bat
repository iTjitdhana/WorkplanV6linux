@echo off
echo ========================================
echo    Docker Status Check
echo ========================================
echo.

echo Checking Docker installation...
docker --version
echo.

echo Checking Docker daemon...
docker info
echo.

echo Checking running containers...
docker ps -a
echo.

echo Checking Docker images...
docker images
echo.

echo Checking Docker networks...
docker network ls
echo.

echo Checking Docker volumes...
docker volume ls
echo.

echo ========================================
echo    Docker Status Summary
echo ========================================
echo.
echo If you see containers running above, they should appear in Docker Desktop.
echo If no containers are shown, there might be an issue with the build process.
echo.
echo To troubleshoot:
echo 1. Check if Docker Desktop is running
echo 2. Try running: docker-compose up --build
echo 3. Check logs: docker-compose logs
echo.
pause
