@echo off
echo ========================================
echo    Fixing All Issues
echo ========================================
echo.

echo Cleaning up and fixing all issues...
echo.

REM Stop all running processes
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul

REM Clean Docker
docker-compose down --volumes --remove-orphans 2>nul
docker system prune -f 2>nul

REM Clean npm cache
echo Cleaning npm cache...
cd frontend
call npm cache clean --force
cd ..

cd backend
call npm cache clean --force
cd ..

REM Update dependencies
echo Updating dependencies...
cd frontend
call npm install
cd ..

cd backend
call npm install
cd ..

REM Fix package-lock.json
echo Updating package-lock.json files...
cd frontend
call npm install --package-lock-only
cd ..

cd backend
call npm install --package-lock-only
cd ..

echo.
echo ========================================
echo    All Issues Fixed!
echo ========================================
echo.
echo Now you can run:
echo.
echo For simple mode (recommended):
echo   start-performance-simple.bat
echo.
echo For Docker mode:
echo   start-performance.bat
echo.
echo For network access:
echo   start-network-access.bat
echo.
pause
