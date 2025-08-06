@echo off
echo Production Deployment
echo =====================
echo.

echo Step 1: Checking Prerequisites...
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js is installed
    node --version
) else (
    echo ✗ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ npm is installed
    npm --version
) else (
    echo ✗ npm not found
    pause
    exit /b 1
)

echo.
echo Step 2: Creating Environment Files...

REM Create backend .env
echo NODE_ENV=production > backend\.env
echo PORT=3101 >> backend\.env
echo DB_HOST=localhost >> backend\.env
echo DB_USER=root >> backend\.env
echo DB_PASSWORD=iT12345$ >> backend\.env
echo DB_NAME=esp_tracker_empty >> backend\.env
echo DB_PORT=3306 >> backend\.env
echo API_RATE_LIMIT=1000 >> backend\.env
echo FRONTEND_URL=http://localhost:3011 >> backend\.env
echo ✓ Backend .env created

REM Create frontend .env.local
echo NEXT_PUBLIC_API_URL=http://localhost:3101 > frontend\.env.local
echo NODE_ENV=production >> frontend\.env.local
echo ✓ Frontend .env.local created

echo.
echo Step 3: Installing Backend Dependencies...
cd backend
call npm install --production
if %errorlevel% equ 0 (
    echo ✓ Backend dependencies installed
) else (
    echo ✗ Backend dependencies installation failed
    pause
)
cd ..

echo.
echo Step 4: Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% equ 0 (
    echo ✓ Frontend dependencies installed
) else (
    echo ✗ Frontend dependencies installation failed
    pause
)
cd ..

echo.
echo Step 5: Building Frontend...
cd frontend
call npm run build
if %errorlevel% equ 0 (
    echo ✓ Frontend built successfully
) else (
    echo ✗ Frontend build failed
    pause
)
cd ..

echo.
echo ========================================
echo 🚀 Deployment Completed!
echo ========================================
echo.

echo Next Steps:
echo.
echo 1. Make sure MySQL is running
echo 2. Start the servers:
echo.
echo    Option A - Use batch files:
echo    start-production.bat
echo.
echo    Option B - Manual start:
echo    Terminal 1: cd backend ^&^& npm start
echo    Terminal 2: cd frontend ^&^& npm start
echo.
echo 3. Access the application:
echo    Frontend: http://localhost:3011
echo    Backend API: http://localhost:3101
echo.

set /p startNow=Would you like to start the servers now? (y/n): 

if /i "%startNow%"=="y" (
    echo.
    echo Starting production servers...
    call start-production.bat
) else (
    echo.
    echo To start servers later, run: start-production.bat
    echo.
    pause
)