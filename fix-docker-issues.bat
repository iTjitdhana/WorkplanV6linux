@echo off
echo ========================================
echo    Fixing Docker Issues
echo ========================================
echo.

echo Cleaning up Docker environment...
echo.

REM Stop and remove existing containers
docker-compose down --volumes --remove-orphans

REM Remove existing images
docker rmi workplan_backend workplan_frontend 2>nul
docker rmi $(docker images -q) 2>nul

REM Clean npm cache
echo Cleaning npm cache...
cd frontend
call npm cache clean --force
cd ..

cd backend
call npm cache clean --force
cd ..

REM Update package-lock.json files
echo Updating package-lock.json files...
cd frontend
call npm install --package-lock-only
cd ..

cd backend
call npm install --package-lock-only
cd ..

echo.
echo ========================================
echo    Docker Issues Fixed!
echo ========================================
echo.
echo Now you can run:
echo   start-performance.bat
echo.
echo Or run Docker directly:
echo   docker-compose up --build -d
echo.
pause
