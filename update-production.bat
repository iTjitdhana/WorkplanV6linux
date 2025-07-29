@echo off
REM 🚀 Update Production Script for WorkplansV4
REM สำหรับการ update ระบบจาก git และ redeploy

setlocal enabledelayedexpansion

echo.
echo ================================
echo WorkplansV4 Production Update
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

echo [INFO] Starting production update process...
echo.

REM Step 1: Check Git status
echo ================================
echo Checking Git Status
echo ================================
echo.

git status
echo.

REM Step 2: Stash any local changes
echo ================================
echo Stashing Local Changes
echo ================================
echo.

echo [INFO] Stashing any local changes...
git stash
if %errorlevel% neq 0 (
    echo [INFO] No local changes to stash
) else (
    echo [INFO] Local changes stashed successfully
)

REM Step 3: Pull latest changes
echo ================================
echo Pulling Latest Changes
echo ================================
echo.

echo [INFO] Pulling latest changes from remote...
git pull origin main
if %errorlevel% neq 0 (
    echo [ERROR] Failed to pull latest changes
    echo [INFO] Trying to reset to remote...
    git reset --hard origin/main
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to reset to remote
        pause
        exit /b 1
    )
) else (
    echo [SUCCESS] Latest changes pulled successfully
)

REM Step 4: Check if production-deploy.bat exists
echo ================================
echo Checking Deployment Script
echo ================================
echo.

if exist "production-deploy.bat" (
    echo [INFO] Found production-deploy.bat
    echo [INFO] Running production deployment...
    call production-deploy.bat
) else (
    echo [WARNING] production-deploy.bat not found
    echo [INFO] Creating production deployment script...
    
    REM Create production-deploy.bat
    (
    echo @echo off
    echo REM 🚀 Production Deployment Script for WorkplansV4
    echo REM สำหรับการ deploy ระบบใน Production Mode หลังจาก git pull
    echo.
    echo setlocal enabledelayedexpansion
    echo.
    echo echo.
    echo echo ================================
    echo echo WorkplansV4 Production Deployment
    echo echo ================================
    echo echo.
    echo.
    echo REM Check if we're in the right directory
    echo if not exist "backend\package.json" ^(
    echo     echo [ERROR] Please run this script from the WorkplansV4 root directory
    echo     pause
    echo     exit /b 1
    echo ^)
    echo.
    echo if not exist "frontend\package.json" ^(
    echo     echo [ERROR] Please run this script from the WorkplansV4 root directory
    echo     pause
    echo     exit /b 1
    echo ^)
    echo.
    echo echo [INFO] Starting production deployment process...
    echo echo.
    echo.
    echo REM Step 1: Check Node.js installation
    echo echo ================================
    echo echo Checking Node.js Installation
    echo echo ================================
    echo echo.
    echo.
    echo node --version ^>nul 2^>^&1
    echo if %%errorlevel%% neq 0 ^(
    echo     echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    echo     echo Download from: https://nodejs.org/
    echo     pause
    echo     exit /b 1
    echo ^) else ^(
    echo     echo [INFO] Node.js is installed
    echo     node --version
    echo ^)
    echo.
    echo REM Step 2: Check if PM2 is installed
    echo echo.
    echo echo ================================
    echo echo Checking PM2 Installation
    echo echo ================================
    echo echo.
    echo.
    echo pm2 --version ^>nul 2^>^&1
    echo if %%errorlevel%% neq 0 ^(
    echo     echo [INFO] Installing PM2 globally...
    echo     call npm install -g pm2
    echo     if %%errorlevel%% neq 0 ^(
    echo         echo [ERROR] Failed to install PM2
    echo         pause
    echo         exit /b 1
    echo     ^)
    echo ^) else ^(
    echo     echo [INFO] PM2 is installed
    echo     pm2 --version
    echo ^)
    echo.
    echo REM Step 3: Stop existing applications
    echo echo.
    echo echo ================================
    echo echo Stopping Existing Applications
    echo echo ================================
    echo echo.
    echo.
    echo echo [INFO] Stopping existing PM2 applications...
    echo call pm2 stop all ^>nul 2^>^&1
    echo call pm2 delete all ^>nul 2^>^&1
    echo echo [INFO] Existing applications stopped
    echo.
    echo REM Step 4: Update Backend
    echo echo.
    echo echo ================================
    echo echo Updating Backend
    echo echo ================================
    echo echo.
    echo.
    echo cd backend
    echo.
    echo REM Install/Update dependencies
    echo echo [INFO] Installing/updating backend dependencies...
    echo call npm install
    echo if %%errorlevel%% neq 0 ^(
    echo     echo [ERROR] Failed to install backend dependencies
    echo     pause
    echo     exit /b 1
    echo ^)
    echo.
    echo REM Check if .env exists, if not create it
    echo if not exist ".env" ^(
    echo     echo [INFO] Creating backend environment file...
    echo     ^(
    echo     echo # Production Environment Variables
    echo     echo DB_HOST=localhost
    echo     echo DB_USER=root
    echo     echo DB_PASSWORD=your_mysql_password
    echo     echo DB_NAME=esp_tracker
    echo     echo DB_PORT=3306
    echo     echo PORT=3101
    echo     echo NODE_ENV=production
    echo     echo FRONTEND_URL=http://localhost:3011
    echo     echo API_RATE_LIMIT=1000
    echo     ^) ^> .env
    echo     echo [WARNING] Please edit backend\.env with your MySQL password
    echo ^) else ^(
    echo     echo [INFO] Backend environment file exists
    echo ^)
    echo.
    echo cd ..
    echo.
    echo REM Step 5: Update Frontend
    echo echo.
    echo echo ================================
    echo echo Updating Frontend
    echo echo ================================
    echo echo.
    echo.
    echo cd frontend
    echo.
    echo REM Install/Update dependencies
    echo echo [INFO] Installing/updating frontend dependencies...
    echo echo [INFO] Using --legacy-peer-deps to resolve dependency conflicts...
    echo call npm install --legacy-peer-deps
    echo if %%errorlevel%% neq 0 ^(
    echo     echo [ERROR] Failed to install frontend dependencies
    echo     echo [INFO] Trying with --force flag...
    echo     call npm install --force
    echo     if %%errorlevel%% neq 0 ^(
    echo         echo [ERROR] Failed to install frontend dependencies even with --force
    echo         pause
    echo         exit /b 1
    echo     ^)
    echo ^)
    echo.
    echo REM Check if .env.local exists, if not create it
    echo if not exist ".env.local" ^(
    echo     echo [INFO] Creating frontend environment file...
    echo     ^(
    echo     echo NEXT_PUBLIC_API_URL=http://localhost:3101
    echo     ^) ^> .env.local
    echo     echo [INFO] Frontend environment file created
    echo ^) else ^(
    echo     echo [INFO] Frontend environment file exists
    echo ^)
    echo.
    echo REM Build for production
    echo echo [INFO] Building frontend for production...
    echo call npm run build
    echo if %%errorlevel%% neq 0 ^(
    echo     echo [ERROR] Failed to build frontend
    echo     pause
    echo     exit /b 1
    echo ^)
    echo.
    echo cd ..
    echo.
    echo REM Step 6: Create/Update PM2 ecosystem config
    echo echo.
    echo echo ================================
    echo echo Creating PM2 Configuration
    echo echo ================================
    echo echo.
    echo.
    echo echo [INFO] Creating PM2 ecosystem config...
    echo ^(
    echo echo module.exports = {
    echo echo   apps: [
    echo echo     {
    echo echo       name: 'workplans-backend',
    echo echo       cwd: './backend',
    echo echo       script: 'server.js',
    echo echo       instances: 1,
    echo echo       autorestart: true,
    echo echo       watch: false,
    echo echo       max_memory_restart: '1G',
    echo echo       env: {
    echo echo         NODE_ENV: 'production',
    echo echo         PORT: 3101
    echo echo       },
    echo echo       error_file: './logs/backend-error.log',
    echo echo       out_file: './logs/backend-out.log',
    echo echo       log_file: './logs/backend-combined.log',
    echo echo       time: true
    echo echo     },
    echo echo     {
    echo echo       name: 'workplans-frontend',
    echo echo       cwd: './frontend',
    echo echo       script: 'npm',
    echo echo       args: 'start',
    echo echo       instances: 1,
    echo echo       autorestart: true,
    echo echo       watch: false,
    echo echo       max_memory_restart: '1G',
    echo echo       env: {
    echo echo         NODE_ENV: 'production',
    echo echo         PORT: 3011
    echo echo       },
    echo echo       error_file: './logs/frontend-error.log',
    echo echo       out_file: './logs/frontend-out.log',
    echo echo       log_file: './logs/frontend-combined.log',
    echo echo       time: true
    echo echo     }
    echo echo   ]
    echo echo }
    echo ^) ^> ecosystem.config.js
    echo.
    echo REM Step 7: Create logs directory
    echo if not exist "logs" ^(
    echo     mkdir logs
    echo     echo [INFO] Created logs directory
    echo ^)
    echo.
    echo REM Step 8: Start applications with PM2
    echo echo.
    echo echo ================================
    echo echo Starting Applications
    echo echo ================================
    echo echo.
    echo.
    echo echo [INFO] Starting applications with PM2...
    echo call pm2 start ecosystem.config.js
    echo if %%errorlevel%% neq 0 ^(
    echo     echo [ERROR] Failed to start applications with PM2
    echo     pause
    echo     exit /b 1
    echo ^)
    echo.
    echo REM Save PM2 configuration
    echo call pm2 save
    echo.
    echo REM Step 9: Create management scripts
    echo echo.
    echo echo ================================
    echo echo Creating Management Scripts
    echo echo ================================
    echo echo.
    echo.
    echo REM Create startup script
    echo echo [INFO] Creating startup script...
    echo ^(
    echo echo @echo off
    echo echo cd /d "%%~dp0"
    echo echo echo Starting WorkplansV4 Production...
    echo echo call pm2 start ecosystem.config.js
    echo echo call pm2 save
    echo echo echo.
    echo echo echo Applications started successfully!
    echo echo echo Frontend: http://localhost:3011
    echo echo echo Backend: http://localhost:3101
    echo echo pause
    echo ^) ^> start-production.bat
    echo.
    echo REM Create stop script
    echo echo [INFO] Creating stop script...
    echo ^(
    echo echo @echo off
    echo echo echo Stopping WorkplansV4 Production...
    echo echo call pm2 stop all
    echo echo echo Applications stopped successfully!
    echo echo pause
    echo ^) ^> stop-production.bat
    echo.
    echo REM Create restart script
    echo echo [INFO] Creating restart script...
    echo ^(
    echo echo @echo off
    echo echo echo Restarting WorkplansV4 Production...
    echo echo call pm2 restart all
    echo echo echo Applications restarted successfully!
    echo echo pause
    echo ^) ^> restart-production.bat
    echo.
    echo REM Create status script
    echo echo [INFO] Creating status script...
    echo ^(
    echo echo @echo off
    echo echo echo WorkplansV4 Production Status:
    echo echo call pm2 status
    echo echo echo.
    echo echo echo Logs location: ./logs/
    echo echo pause
    echo ^) ^> status-production.bat
    echo.
    echo REM Create logs script
    echo echo [INFO] Creating logs script...
    echo ^(
    echo echo @echo off
    echo echo echo WorkplansV4 Production Logs:
    echo echo call pm2 logs
    echo echo pause
    echo ^) ^> logs-production.bat
    echo.
    echo REM Create update script
    echo echo [INFO] Creating update script...
    echo ^(
    echo echo @echo off
    echo echo echo Updating WorkplansV4 Production...
    echo echo echo.
    echo echo echo [STEP 1] Pull latest changes...
    echo echo git pull origin main
    echo echo echo.
    echo echo echo [STEP 2] Run production deployment...
    echo echo call production-deploy.bat
    echo echo echo.
    echo echo echo Update completed!
    echo echo pause
    echo ^) ^> update-production.bat
    echo.
    echo REM Step 10: Show final status
    echo echo.
    echo echo ================================
    echo echo Deployment Completed Successfully!
    echo echo ================================
    echo echo.
    echo.
    echo echo 🎉 WorkplansV4 Production is now deployed!
    echo echo.
    echo echo 📱 Access URLs:
    echo echo    Frontend: http://localhost:3011
    echo echo    Backend API: http://localhost:3101
    echo echo    Tracker: http://localhost:3011/tracker
    echo echo.
    echo echo 🔧 Management Scripts Created:
    echo echo    start-production.bat - Start all applications
    echo echo    stop-production.bat - Stop all applications
    echo echo    restart-production.bat - Restart all applications
    echo echo    status-production.bat - Check application status
    echo echo    logs-production.bat - View application logs
    echo echo    update-production.bat - Update from git and redeploy
    echo echo.
    echo echo 📊 PM2 Commands:
    echo echo    pm2 status - Check status
    echo echo    pm2 logs - View logs
    echo echo    pm2 restart all - Restart all
    echo echo    pm2 stop all - Stop all
    echo echo    pm2 monit - Monitor resources
    echo echo.
    echo echo 🔄 Quick Update Process:
    echo echo    1. git pull origin main
    echo echo    2. Run: production-deploy.bat
    echo echo    หรือใช้: update-production.bat
    echo echo.
    echo echo ⚠️  Important Notes:
    echo echo    1. Make sure MySQL is running
    echo echo    2. Check backend\.env for correct database settings
    echo echo    3. Ensure ports 3011 and 3101 are not blocked by firewall
    echo echo    4. Logs are saved in ./logs/ directory
    echo echo.
    echo echo 📞 If you encounter any issues:
    echo echo    - Check PM2 logs: pm2 logs
    echo echo    - Check application logs in ./logs/
    echo echo    - Check MySQL status
    echo echo    - Check Windows Firewall settings
    echo echo.
    echo.
    echo REM Show current status
    echo echo [INFO] Current application status:
    echo call pm2 status
    echo.
    echo echo.
    echo echo ================================
    echo echo ✅ Production Deployment Complete!
    echo echo ================================
    echo echo.
    echo.
    echo pause
    ) > production-deploy.bat
    
    echo [INFO] Created production-deploy.bat
    echo [INFO] Running production deployment...
    call production-deploy.bat
)

echo.
echo ================================
echo ✅ Production Update Complete!
echo ================================
echo.

echo 🎉 WorkplansV4 has been updated and deployed successfully!
echo.
echo 📱 Access URLs:
echo    Frontend: http://localhost:3011
echo    Backend API: http://localhost:3101
echo    Tracker: http://localhost:3011/tracker
echo.
echo 🔧 Management Scripts Available:
echo    start-production.bat - Start all applications
echo    stop-production.bat - Stop all applications
echo    restart-production.bat - Restart all applications
echo    status-production.bat - Check application status
echo    logs-production.bat - View application logs
echo    update-production.bat - Update from git and redeploy
echo.

pause 