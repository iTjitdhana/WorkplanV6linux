@echo off
echo ========================================
echo    Fix Docker TypeScript Issues
echo ========================================
echo.

echo Cleaning up Docker environment...
docker-compose down
docker system prune -f
echo.

echo Cleaning npm cache...
cd frontend
call npm cache clean --force
cd ..

cd backend
call npm cache clean --force
cd ..

echo.
echo Reinstalling dependencies...
cd frontend
call npm install
cd ..

cd backend
call npm install
cd ..

echo.
echo Testing build locally...
cd frontend
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Frontend build failed locally!
    echo Please check the TypeScript errors above.
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo    Build Test Successful!
echo ========================================
echo.
echo Now trying Docker build...
echo.

docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo ERROR: Docker build still failed!
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
