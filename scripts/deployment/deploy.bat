@echo off
REM 🚀 WorkplansV4 Auto Deployment Script for Windows
REM สำหรับการ deploy ระบบไปยัง Windows Server

setlocal enabledelayedexpansion

echo.
echo ================================
echo WorkplansV4 Auto Deployment
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

echo [INFO] Starting deployment process...

REM Step 1: Check Node.js installation
echo.
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

REM Step 2: Check MySQL installation
echo.
echo ================================
echo Checking MySQL Installation
echo ================================
echo.

mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MySQL is not installed or not in PATH
    echo Please install MySQL manually or ensure it's in your PATH
    echo Download from: https://dev.mysql.com/downloads/mysql/
    echo.
    echo [INFO] You can continue without MySQL for now and install it later
    echo [INFO] The system will work with SQLite as fallback
    pause
) else (
    echo [INFO] MySQL is installed
    mysql --version
)

REM Step 3: Setup Backend
echo.
echo ================================
echo Setting up Backend
echo ================================
echo.

cd backend

REM Install dependencies
echo [INFO] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

REM Create .env file
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

echo [INFO] Backend environment file created
echo [INFO] Please edit backend\.env with your MySQL password

cd ..

REM Step 4: Setup Frontend
echo.
echo ================================
echo Setting up Frontend
echo ================================
echo.

cd frontend

REM Install dependencies
echo [INFO] Installing frontend dependencies...
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

REM Create .env.local file
echo [INFO] Creating frontend environment file...
(
echo NEXT_PUBLIC_API_URL=http://localhost:3101
) > .env.local

echo [INFO] Frontend environment file created

REM Build for production
echo [INFO] Building frontend for production...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
)

cd ..

REM Step 5: Install PM2 globally
echo.
echo ================================
echo Installing PM2 Process Manager
echo ================================
echo.

echo [INFO] Installing PM2 globally...
call npm install -g pm2
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install PM2
    pause
    exit /b 1
)

REM Step 6: Create PM2 ecosystem config
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
echo       }
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
echo       }
echo     }
echo   ]
echo }
) > ecosystem.config.js

REM Step 7: Start applications with PM2
echo [INFO] Starting applications with PM2...
call pm2 start ecosystem.config.js
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start applications with PM2
    pause
    exit /b 1
)

REM Save PM2 configuration
call pm2 save

REM Step 8: Create startup script
echo [INFO] Creating startup script...
(
echo @echo off
echo cd /d "%~dp0"
echo call pm2 start ecosystem.config.js
echo echo Applications started successfully!
echo pause
) > start-applications.bat

REM Step 9: Create stop script
echo [INFO] Creating stop script...
(
echo @echo off
echo call pm2 stop all
echo echo Applications stopped successfully!
echo pause
) > stop-applications.bat

REM Step 10: Create restart script
echo [INFO] Creating restart script...
(
echo @echo off
echo call pm2 restart all
echo echo Applications restarted successfully!
echo pause
) > restart-applications.bat

REM Step 11: Create status script
echo [INFO] Creating status script...
(
echo @echo off
echo call pm2 status
echo pause
) > check-status.bat

REM Step 12: Create logs script
echo [INFO] Creating logs script...
(
echo @echo off
echo call pm2 logs
echo pause
) > view-logs.bat

echo.
echo ================================
echo Deployment Completed Successfully!
echo ================================
echo.
echo 🎉 Your WorkplansV4 system is now deployed!
echo.
echo 📱 Access URLs:
echo    Frontend: http://localhost:3011
echo    Backend API: http://localhost:3101
echo    Tracker: http://localhost:3011/tracker
echo.
echo 🔧 Management Scripts Created:
echo    start-applications.bat - Start all applications
echo    stop-applications.bat - Stop all applications
echo    restart-applications.bat - Restart all applications
echo    check-status.bat - Check application status
echo    view-logs.bat - View application logs
echo.
echo 📊 PM2 Commands:
echo    pm2 status - Check status
echo    pm2 logs - View logs
echo    pm2 restart all - Restart all
echo    pm2 stop all - Stop all
echo    pm2 monit - Monitor resources
echo.
echo 🔄 Update Commands:
echo    git pull origin main
echo    cd backend ^&^& npm install
echo    cd frontend ^&^& npm install ^&^& npm run build
echo    pm2 restart all
echo.
echo ⚠️  Important Notes:
echo    1. Make sure MySQL is running
echo    2. Edit backend\.env with your MySQL password
echo    3. Ensure ports 3011 and 3101 are not blocked by firewall
echo    4. Run start-applications.bat to start the system
echo.
echo 📞 If you encounter any issues:
echo    - Check PM2 logs: pm2 logs
echo    - Check MySQL status
echo    - Check Windows Firewall settings
echo.

pause 