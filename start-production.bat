@echo off
REM 🚀 Production Mode Startup Script
REM สำหรับรันระบบใน Production Mode ที่มีประสิทธิภาพสูงสุด

echo.
echo ================================
echo Production Mode Startup
echo ================================
echo.

echo [INFO] Starting WorkplanV5 in Production Mode...
echo [INFO] This will optimize performance for production use
echo.

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PM2 is not installed
    echo [INFO] Installing PM2 globally...
    npm install -g pm2
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install PM2
        pause
        exit /b 1
    )
)

echo.
echo [STEP 1] Building Frontend for Production
echo ================================
cd frontend

echo [INFO] Installing dependencies with production optimizations...
call npm install --legacy-peer-deps --production

echo [INFO] Building frontend for production...
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)

echo [SUCCESS] Frontend built successfully!

cd ..

echo.
echo [STEP 2] Setting up Backend for Production
echo ================================
cd backend

echo [INFO] Installing backend dependencies...
call npm install --production

echo [INFO] Creating production environment file...
if not exist .env (
    echo [INFO] Creating .env file for production...
    (
    echo # Production Environment Variables
    echo DB_HOST=localhost
    echo DB_USER=root
    echo DB_PASSWORD=your_mysql_password
    echo DB_NAME=esp_tracker
    echo DB_PORT=3306
    echo PORT=3101
    echo NODE_ENV=production
    echo FRONTEND_URL=http://localhost:3011
    echo API_RATE_LIMIT=1000
    echo CORS_ORIGIN=http://localhost:3011
    echo JWT_SECRET=your_jwt_secret_key_here
    echo SESSION_SECRET=your_session_secret_here
    ) > .env
    echo [INFO] Please edit backend\.env with your actual MySQL password
)

cd ..

echo.
echo [STEP 3] Starting Services with PM2
echo ================================

echo [INFO] Stopping existing PM2 processes...
pm2 stop all 2>nul
pm2 delete all 2>nul

echo [INFO] Starting Backend with PM2...
cd backend
pm2 start server.js --name "workplan-backend" --env production --max-memory-restart 512M --node-args="--max-old-space-size=512"

echo [INFO] Starting Frontend with PM2...
cd ../frontend
pm2 start npm --name "workplan-frontend" -- start --env production

cd ..

echo.
echo [STEP 4] Saving PM2 Configuration
echo ================================
pm2 save
pm2 startup

echo.
echo [STEP 5] Setting up Auto-restart
echo ================================
echo [INFO] Configuring PM2 to auto-restart on system reboot...
pm2 startup
echo [INFO] Run the command above as Administrator if prompted

echo.
echo [STEP 6] Performance Monitoring
echo ================================
echo [INFO] Starting PM2 monitoring...
pm2 monit

echo.
echo ================================
echo 🎉 Production Mode Started Successfully!
echo ================================
echo.
echo [ACCESS URLs]
echo Backend API: http://localhost:3101
echo Frontend App: http://localhost:3011
echo PM2 Dashboard: pm2 monit
echo.
echo [MANAGEMENT COMMANDS]
echo View logs: pm2 logs
echo Restart all: pm2 restart all
echo Stop all: pm2 stop all
echo Status: pm2 status
echo.
echo [PERFORMANCE TIPS]
echo - Backend uses 512MB memory limit
echo - Frontend optimized for production
echo - Auto-restart on crashes
echo - Monitoring enabled
echo.
pause 