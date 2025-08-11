@echo off
echo ========================================
echo    Test Build
echo ========================================
echo.

echo Testing frontend build...
cd frontend
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    echo.
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo    Build Successful!
echo ========================================
echo.
echo Now testing Docker build...
echo.

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
echo ========================================
echo.
echo Checking container status...
docker ps
echo.
echo Containers should now appear in Docker Desktop!
echo.
pause 