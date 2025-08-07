@echo off
echo ========================================
echo    Fix Docker Build Issues
========================================
echo.

echo Cleaning up Docker build issues...
echo.

echo 1. Stopping Docker containers...
docker-compose down

echo.
echo 2. Cleaning up Docker cache...
docker system prune -f

echo.
echo 3. Removing node_modules from frontend...
cd frontend
if exist node_modules rmdir /s /q node_modules
if exist .next rmdir /s /q .next
if exist pnpm-lock.yaml del pnpm-lock.yaml

echo.
echo 4. Installing dependencies with npm...
npm install

echo.
echo 5. Building frontend...
npm run build

if errorlevel 1 (
    echo.
    echo ERROR: Frontend build failed!
    echo.
    pause
    exit /b 1
)

echo.
echo 6. Going back to root...
cd ..

echo.
echo 7. Cleaning up backend node_modules...
cd backend
if exist node_modules rmdir /s /q node_modules

echo.
echo 8. Installing backend dependencies...
npm install

echo.
echo 9. Going back to root...
cd ..

echo.
echo ========================================
echo    Cleanup Complete!
========================================
echo.
echo Now try running Docker again:
echo .\start-docker-fixed.bat
echo.
echo Or try the simple version:
echo .\start-docker-simple.bat
echo.
pause
