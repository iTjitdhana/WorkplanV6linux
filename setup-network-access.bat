@echo off
REM 🌐 Network Access Setup Script
REM สำหรับตั้งค่าให้เครื่องอื่นเข้าถึงระบบได้

echo.
echo ================================
echo Network Access Setup
echo ================================
echo.

echo [INFO] Setting up network access for WorkplanV5...
echo [INFO] This will allow other devices to access the system
echo.

REM Get current IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP: =%

echo [INFO] Current IP Address: %IP%
echo [INFO] Other devices can access via: http://%IP%:3011
echo.

REM Step 1: Update Backend CORS settings
echo [STEP 1] Updating Backend CORS Settings
echo ================================
cd backend

echo [INFO] Creating network-enabled .env file...
(
echo # Production Environment Variables with Network Access
echo DB_HOST=localhost
echo DB_USER=root
echo DB_PASSWORD=your_mysql_password
echo DB_NAME=esp_tracker
echo DB_PORT=3306
echo PORT=3101
echo NODE_ENV=production
echo FRONTEND_URL=http://%IP%:3011
echo API_RATE_LIMIT=1000
echo CORS_ORIGIN=http://%IP%:3011
echo JWT_SECRET=your_jwt_secret_key_here
echo SESSION_SECRET=your_session_secret_here
echo ALLOWED_ORIGINS=http://localhost:3011,http://127.0.0.1:3011,http://%IP%:3011
) > .env

echo [SUCCESS] Backend CORS updated for network access
cd ..

REM Step 2: Update Frontend API URL
echo.
echo [STEP 2] Updating Frontend API URL
echo ================================
cd frontend

echo [INFO] Creating network-enabled .env.local file...
(
echo NEXT_PUBLIC_API_URL=http://%IP%:3101
echo NEXT_PUBLIC_FRONTEND_URL=http://%IP%:3011
) > .env.local

echo [SUCCESS] Frontend API URL updated for network access
cd ..

REM Step 3: Windows Firewall Configuration
echo.
echo [STEP 3] Windows Firewall Configuration
echo ================================
echo [INFO] Adding firewall rules for network access...

REM Add firewall rules (run as administrator)
netsh advfirewall firewall add rule name="WorkplanV5 Backend" dir=in action=allow protocol=TCP localport=3101
netsh advfirewall firewall add rule name="WorkplanV5 Frontend" dir=in action=allow protocol=TCP localport=3011

echo [SUCCESS] Firewall rules added
echo.

REM Step 4: Create Network Access Script
echo [STEP 4] Creating Network Access Script
echo ================================
(
echo @echo off
echo REM 🌐 Network Access Information
echo echo.
echo echo ================================
echo echo Network Access Setup Complete!
echo echo ================================
echo echo.
echo echo [ACCESS URLs]
echo echo Local Access:
echo echo - Frontend: http://localhost:3011
echo echo - Backend: http://localhost:3101
echo echo.
echo echo Network Access:
echo echo - Frontend: http://%IP%:3011
echo echo - Backend: http://%IP%:3101
echo echo.
echo echo [IMPORTANT NOTES]
echo echo 1. Make sure Windows Firewall allows connections
echo echo 2. Other devices must be on the same network
echo echo 3. If using antivirus, allow the ports
echo echo 4. For external access, configure router port forwarding
echo echo.
echo echo [TROUBLESHOOTING]
echo echo If other devices cannot access:
echo echo 1. Check Windows Firewall settings
echo echo 2. Verify IP address is correct
echo echo 3. Test with: ping %IP%
echo echo 4. Check antivirus settings
echo echo.
echo pause
) > network-access-info.bat

echo [SUCCESS] Network access information script created
echo.

REM Step 5: Update PM2 Configuration for Network
echo [STEP 5] Updating PM2 Configuration
echo ================================
echo [INFO] Creating network-enabled PM2 configuration...

(
echo module.exports = {
echo   apps: [
echo     {
echo       name: 'workplan-backend',
echo       script: 'server.js',
echo       cwd: './backend',
echo       instances: 'max',
echo       exec_mode: 'cluster',
echo       env: {
echo         NODE_ENV: 'production',
echo         PORT: 3101,
echo         HOST: '0.0.0.0'
echo       },
echo       max_memory_restart: '512M',
echo       node_args: '--max-old-space-size=512',
echo       error_file: './logs/backend-error.log',
echo       out_file: './logs/backend-out.log',
echo       log_file: './logs/backend-combined.log',
echo       time: true,
echo       autorestart: true,
echo       watch: false,
echo       max_restarts: 10,
echo       min_uptime: '10s'
echo     },
echo     {
echo       name: 'workplan-frontend',
echo       script: 'npm',
echo       args: 'start',
echo       cwd: './frontend',
echo       env: {
echo         NODE_ENV: 'production',
echo         PORT: 3011,
echo         HOST: '0.0.0.0'
echo       },
echo       max_memory_restart: '256M',
echo       node_args: '--max-old-space-size=256',
echo       error_file: './logs/frontend-error.log',
echo       out_file: './logs/frontend-out.log',
echo       log_file: './logs/frontend-combined.log',
echo       time: true,
echo       autorestart: true,
echo       watch: false,
echo       max_restarts: 10,
echo       min_uptime: '10s'
echo     }
echo   ]
echo };
) > ecosystem-network.config.js

echo [SUCCESS] Network-enabled PM2 configuration created
echo.

echo ================================
echo ✅ Network Access Setup Complete!
echo ================================
echo.
echo [ACCESS INFORMATION]
echo Local Access:
echo - Frontend: http://localhost:3011
echo - Backend: http://localhost:3101
echo.
echo Network Access:
echo - Frontend: http://%IP%:3011
echo - Backend: http://%IP%:3101
echo.
echo [NEXT STEPS]
echo 1. Restart services: pm2 restart all
echo 2. Test local access first
echo 3. Test network access from another device
echo 4. Run: network-access-info.bat for more info
echo.
echo [TROUBLESHOOTING]
echo If network access doesn't work:
echo 1. Check Windows Firewall
echo 2. Verify IP address
echo 3. Test with ping command
echo 4. Check antivirus settings
echo.
pause 