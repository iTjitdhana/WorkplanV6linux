@echo off
REM 🚀 Production Deployment Script for WorkplansV4
REM สำหรับการ deploy ระบบใน Production Mode หลังจาก git pull

setlocal enabledelayedexpansion

echo.
echo ================================
echo WorkplansV4 Production Deployment
echo ================================
echo.

REM Check if we're in the right directory
if not exist "backend\package.json" (
    echo [ERROR] Please run this script from the WorkplansV4 root directory
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo [ERROR] Please run this script from the WorkplansV4 root directory
    pause
    exit /b 1
)

echo [INFO] Starting production deployment process...
echo.

REM Step 1: Check Node.js installation
echo ================================
echo Checking Node.js Installation
echo ================================
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [INFO] Node.js is installed
    node --version
)

REM Step 2: Check if PM2 is installed
echo.
echo ================================
echo Checking PM2 Installation
echo ================================
echo.

pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing PM2 globally...
    call npm install -g pm2
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install PM2
        pause
        exit /b 1
    )
) else (
    echo [INFO] PM2 is installed
    pm2 --version
)

REM Step 3: Stop existing applications
echo.
echo ================================
echo Stopping Existing Applications
echo ================================
echo.

echo [INFO] Stopping existing PM2 applications...
call pm2 stop all >nul 2>&1
call pm2 delete all >nul 2>&1
echo [INFO] Existing applications stopped

REM Step 4: Update Backend
echo.
echo ================================
echo Updating Backend
echo ================================
echo.

cd backend

REM Install/Update dependencies
echo [INFO] Installing/updating backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

REM Check if .env exists, if not create it
if not exist ".env" (
    echo [INFO] Creating backend environment file...
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
    ) > .env
    echo [WARNING] Please edit backend\.env with your MySQL password
) else (
    echo [INFO] Backend environment file exists
)

cd ..

REM Step 5: Update Frontend
echo.
echo ================================
echo Updating Frontend
echo ================================
echo.

cd frontend

REM Install/Update dependencies
echo [INFO] Installing/updating frontend dependencies...
echo [INFO] Using --legacy-peer-deps to resolve dependency conflicts...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    echo [INFO] Trying with --force flag...
    call npm install --force
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies even with --force
        pause
        exit /b 1
    )
)

REM Check if .env.local exists, if not create it
if not exist ".env.local" (
    echo [INFO] Creating frontend environment file...
    (
    echo NEXT_PUBLIC_API_URL=http://localhost:3101
    ) > .env.local
    echo [INFO] Frontend environment file created
) else (
    echo [INFO] Frontend environment file exists
)

REM Build for production
echo [INFO] Building frontend for production...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
)

cd ..

REM Step 6: Create/Update PM2 ecosystem config
echo.
echo ================================
echo Creating PM2 Configuration
echo ================================
echo.

echo [INFO] Creating PM2 ecosystem config...
(
echo module.exports = {
echo   apps: [
echo     {
echo       name: 'workplans-backend',
echo       cwd: './backend',
echo       script: 'server.js',
echo       instances: 1,
echo       autorestart: true,
echo       watch: false,
echo       max_memory_restart: '1G',
echo       env: {
echo         NODE_ENV: 'production',
echo         PORT: 3101
echo       },
echo       error_file: './logs/backend-error.log',
echo       out_file: './logs/backend-out.log',
echo       log_file: './logs/backend-combined.log',
echo       time: true
echo     },
echo     {
echo       name: 'workplans-frontend',
echo       cwd: './frontend',
echo       script: 'npm',
echo       args: 'start',
echo       instances: 1,
echo       autorestart: true,
echo       watch: false,
echo       max_memory_restart: '1G',
echo       env: {
echo         NODE_ENV: 'production',
echo         PORT: 3011
echo       },
echo       error_file: './logs/frontend-error.log',
echo       out_file: './logs/frontend-out.log',
echo       log_file: './logs/frontend-combined.log',
echo       time: true
echo     }
echo   ]
echo }
) > ecosystem.config.js

REM Step 7: Create logs directory
if not exist "logs" (
    mkdir logs
    echo [INFO] Created logs directory
)

REM Step 8: Start applications with PM2
echo.
echo ================================
echo Starting Applications
echo ================================
echo.

echo [INFO] Starting applications with PM2...
call pm2 start ecosystem.config.js
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start applications with PM2
    pause
    exit /b 1
)

REM Save PM2 configuration
call pm2 save

REM Step 9: Create management scripts
echo.
echo ================================
echo Creating Management Scripts
echo ================================
echo.

REM Create startup script
echo [INFO] Creating startup script...
(
echo @echo off
echo cd /d "%~dp0"
echo echo Starting WorkplansV4 Production...
echo call pm2 start ecosystem.config.js
echo call pm2 save
echo echo.
echo echo Applications started successfully!
echo echo Frontend: http://localhost:3011
echo echo Backend: http://localhost:3101
echo pause
) > start-production.bat

REM Create stop script
echo [INFO] Creating stop script...
(
echo @echo off
echo echo Stopping WorkplansV4 Production...
echo call pm2 stop all
echo echo Applications stopped successfully!
echo pause
) > stop-production.bat

REM Create restart script
echo [INFO] Creating restart script...
(
echo @echo off
echo echo Restarting WorkplansV4 Production...
echo call pm2 restart all
echo echo Applications restarted successfully!
echo pause
) > restart-production.bat

REM Create status script
echo [INFO] Creating status script...
(
echo @echo off
echo echo WorkplansV4 Production Status:
echo call pm2 status
echo echo.
echo echo Logs location: ./logs/
echo pause
) > status-production.bat

REM Create logs script
echo [INFO] Creating logs script...
(
echo @echo off
echo echo WorkplansV4 Production Logs:
echo call pm2 logs
echo pause
) > logs-production.bat

REM Create update script
echo [INFO] Creating update script...
(
echo @echo off
echo echo Updating WorkplansV4 Production...
echo echo.
echo echo [STEP 1] Pull latest changes...
echo git pull origin main
echo echo.
echo echo [STEP 2] Run production deployment...
echo call production-deploy.bat
echo echo.
echo echo Update completed!
echo pause
) > update-production.bat

REM Step 10: Show final status
echo.
echo ================================
echo Deployment Completed Successfully!
echo ================================
echo.

echo 🎉 WorkplansV4 Production is now deployed!
echo.
echo 📱 Access URLs:
echo    Frontend: http://localhost:3011
echo    Backend API: http://localhost:3101
echo    Tracker: http://localhost:3011/tracker
echo.
echo 🔧 Management Scripts Created:
echo    start-production.bat - Start all applications
echo    stop-production.bat - Stop all applications
echo    restart-production.bat - Restart all applications
echo    status-production.bat - Check application status
echo    logs-production.bat - View application logs
echo    update-production.bat - Update from git and redeploy
echo.
echo 📊 PM2 Commands:
echo    pm2 status - Check status
echo    pm2 logs - View logs
echo    pm2 restart all - Restart all
echo    pm2 stop all - Stop all
echo    pm2 monit - Monitor resources
echo.
echo 🔄 Quick Update Process:
echo    1. git pull origin main
echo    2. Run: production-deploy.bat
echo    หรือใช้: update-production.bat
echo.
echo ⚠️  Important Notes:
echo    1. Make sure MySQL is running
echo    2. Check backend\.env for correct database settings
echo    3. Ensure ports 3011 and 3101 are not blocked by firewall
echo    4. Logs are saved in ./logs/ directory
echo.
echo 📞 If you encounter any issues:
echo    - Check PM2 logs: pm2 logs
echo    - Check application logs in ./logs/
echo    - Check MySQL status
echo    - Check Windows Firewall settings
echo.

REM Show current status
echo [INFO] Current application status:
call pm2 status

echo.
echo ================================
echo ✅ Production Deployment Complete!
echo ================================
echo.

pause 