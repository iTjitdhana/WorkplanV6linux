@echo off
echo ========================================
echo Setting up WorkplanV6 for 192.168.0.94
echo ========================================

echo.
echo [1/5] Checking network connectivity...
ping -n 1 192.168.0.94 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cannot reach 192.168.0.94
    echo Please check your network connection
    pause
    exit /b 1
)
echo ✅ Network connectivity OK

echo.
echo [2/5] Setting up backend environment...
if not exist "backend\.env" (
    copy "backend\env.example" "backend\.env"
    echo ✅ Created backend .env file
) else (
    echo ℹ️  Backend .env already exists
)

echo.
echo [3/5] Setting up frontend environment...
if not exist "frontend\.env.local" (
    copy "frontend\env.example" "frontend\.env.local"
    echo ✅ Created frontend .env.local file
) else (
    echo ℹ️  Frontend .env.local already exists
)

echo.
echo [4/5] Installing dependencies...
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies installation failed
    pause
    exit /b 1
)

echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependencies installation failed
    pause
    exit /b 1
)
cd ..

echo.
echo [5/5] Starting Docker containers...
echo Starting with 192.168.0.94 configuration...
docker-compose up -d

echo.
echo ========================================
echo Setup completed!
echo ========================================
echo.
echo Frontend: http://192.168.0.94:3011
echo Backend API: http://192.168.0.94:3101
echo Database: 192.168.0.94:3306
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
pause
