@echo off
REM 🛠️ System Management Script
REM สำหรับจัดการระบบ WorkplanV5 ในอนาคต

echo.
echo ================================
echo WorkplanV5 System Management
echo ================================
echo.

echo [INFO] WorkplanV5 System Management Tool
echo.

:menu
echo.
echo ================================
echo [MAIN MENU]
echo ================================
echo.
echo [1] Development Mode
echo [2] Production Mode
echo [3] Database Management
echo [4] System Health Check
echo [5] Update System
echo [6] Troubleshooting
echo [7] Network Access
echo [8] Performance Optimization
echo [9] Backup & Restore
echo [0] Exit
echo.
set /p choice="Enter your choice (0-9): "

if "%choice%"=="1" goto :development
if "%choice%"=="2" goto :production
if "%choice%"=="3" goto :database
if "%choice%"=="4" goto :health_check
if "%choice%"=="5" goto :update
if "%choice%"=="6" goto :troubleshooting
if "%choice%"=="7" goto :network
if "%choice%"=="8" goto :optimization
if "%choice%"=="9" goto :backup
if "%choice%"=="0" goto :exit
goto :menu

:development
echo.
echo ================================
echo Development Mode
echo ================================
echo.
echo [INFO] Starting development mode...
echo.

echo [STEP 1] Checking database...
call check-existing-database.bat
echo.

echo [STEP 2] Starting backend...
cd backend
start "Backend Server" cmd /k "npm start"
cd ..
echo.

echo [STEP 3] Starting frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..
echo.

echo [SUCCESS] Development mode started!
echo [INFO] Access your application:
echo - Frontend: http://localhost:3011
echo - Backend: http://localhost:3101
echo.
pause
goto :menu

:production
echo.
echo ================================
echo Production Mode
echo ================================
echo.
echo [INFO] Starting production mode...
echo.

echo [STEP 1] Building frontend...
cd frontend
npm run build
cd ..
echo.

echo [STEP 2] Starting production backend...
cd backend
start "Production Backend" cmd /k "npm start"
cd ..
echo.

echo [STEP 3] Serving frontend...
cd frontend
start "Production Frontend" cmd /k "npx serve -s out -p 3011"
cd ..
echo.

echo [SUCCESS] Production mode started!
echo [INFO] Access your application:
echo - Frontend: http://localhost:3011
echo - Backend: http://localhost:3101
echo.
pause
goto :menu

:database
echo.
echo ================================
echo Database Management
echo ================================
echo.
echo [1] Check Database Status
echo [2] Setup Database
echo [3] Fix Database Issues
echo [4] Backup Database
echo [5] Restore Database
echo [0] Back to Main Menu
echo.
set /p db_choice="Enter your choice (0-5): "

if "%db_choice%"=="1" (
    call check-existing-database.bat
    pause
    goto :database
)
if "%db_choice%"=="2" (
    call setup-existing-mysql.bat
    pause
    goto :database
)
if "%db_choice%"=="3" (
    call fix-mysql-service.bat
    pause
    goto :database
)
if "%db_choice%"=="4" (
    echo [INFO] Creating database backup...
    mysql -u jitdhana -piT12345$ esp_tracker > backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
    echo [SUCCESS] Backup created!
    pause
    goto :database
)
if "%db_choice%"=="5" (
    echo [INFO] Restoring database...
    echo Please select backup file to restore...
    pause
    goto :database
)
if "%db_choice%"=="0" goto :menu
goto :database

:health_check
echo.
echo ================================
echo System Health Check
echo ================================
echo.
echo [INFO] Performing system health check...
echo.

echo [STEP 1] Checking MySQL service...
sc query MySQL80 | findstr "RUNNING"
if %errorlevel% neq 0 (
    echo [ERROR] MySQL service is not running
) else (
    echo [SUCCESS] MySQL service is running
)
echo.

echo [STEP 2] Checking Node.js processes...
tasklist | findstr node
if %errorlevel% neq 0 (
    echo [INFO] No Node.js processes found
) else (
    echo [SUCCESS] Node.js processes found
)
echo.

echo [STEP 3] Checking ports...
netstat -an | findstr ":3011"
netstat -an | findstr ":3101"
echo.

echo [STEP 4] Testing database connection...
mysql -u jitdhana -piT12345$ -e "SELECT 1;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Database connection failed
) else (
    echo [SUCCESS] Database connection working
)
echo.

echo [STEP 5] Testing backend API...
curl -s http://localhost:3101 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Backend API not accessible
) else (
    echo [SUCCESS] Backend API accessible
)
echo.

echo [STEP 6] Testing frontend...
curl -s http://localhost:3011 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Frontend not accessible
) else (
    echo [SUCCESS] Frontend accessible
)
echo.

echo [SUCCESS] Health check complete!
pause
goto :menu

:update
echo.
echo ================================
echo Update System
echo ================================
echo.
echo [INFO] Updating system...
echo.

echo [STEP 1] Pulling latest changes...
git pull origin main
echo.

echo [STEP 2] Updating backend dependencies...
cd backend
npm install
cd ..
echo.

echo [STEP 3] Updating frontend dependencies...
cd frontend
npm install
cd ..
echo.

echo [STEP 4] Restarting services...
echo [INFO] Please restart development/production servers manually
echo.
echo [SUCCESS] System updated!
pause
goto :menu

:troubleshooting
echo.
echo ================================
echo Troubleshooting
echo ================================
echo.
echo [1] Fix Database Issues
echo [2] Fix Dependencies Issues
echo [3] Fix Network Issues
echo [4] Fix Performance Issues
echo [5] Quick Fix All
echo [0] Back to Main Menu
echo.
set /p trouble_choice="Enter your choice (0-5): "

if "%trouble_choice%"=="1" (
    call fix-mysql-service.bat
    pause
    goto :troubleshooting
)
if "%trouble_choice%"=="2" (
    call fix-dependencies.bat
    pause
    goto :troubleshooting
)
if "%trouble_choice%"=="3" (
    call setup-network-access.bat
    pause
    goto :troubleshooting
)
if "%trouble_choice%"=="4" (
    call optimize-performance.bat
    pause
    goto :troubleshooting
)
if "%trouble_choice%"=="5" (
    echo [INFO] Running quick fix all...
    call check-existing-database.bat
    call fix-dependencies.bat
    call setup-network-access.bat
    echo [SUCCESS] Quick fix complete!
    pause
    goto :troubleshooting
)
if "%trouble_choice%"=="0" goto :menu
goto :troubleshooting

:network
echo.
echo ================================
echo Network Access
echo ================================
echo.
echo [1] Setup Network Access
echo [2] Test Network Access
echo [3] Show Network Info
echo [0] Back to Main Menu
echo.
set /p net_choice="Enter your choice (0-3): "

if "%net_choice%"=="1" (
    call setup-network-access.bat
    pause
    goto :network
)
if "%net_choice%"=="2" (
    call test-network-access.bat
    pause
    goto :network
)
if "%net_choice%"=="3" (
    echo [INFO] Network Information:
    ipconfig | findstr "IPv4"
    echo.
    echo [INFO] Local Access:
    echo - Frontend: http://localhost:3011
    echo - Backend: http://localhost:3101
    echo.
    echo [INFO] Network Access:
    echo - Frontend: http://[YOUR_IP]:3011
    echo - Backend: http://[YOUR_IP]:3101
    pause
    goto :network
)
if "%net_choice%"=="0" goto :menu
goto :network

:optimization
echo.
echo ================================
echo Performance Optimization
echo ================================
echo.
echo [1] Optimize Performance
echo [2] Monitor Performance
echo [3] Clean System
echo [0] Back to Main Menu
echo.
set /p opt_choice="Enter your choice (0-3): "

if "%opt_choice%"=="1" (
    call optimize-performance.bat
    pause
    goto :optimization
)
if "%opt_choice%"=="2" (
    echo [INFO] Starting performance monitor...
    echo [INFO] Press Ctrl+C to stop monitoring
    timeout /t 5 >nul
    echo [INFO] Performance monitoring stopped
    pause
    goto :optimization
)
if "%opt_choice%"=="3" (
    echo [INFO] Cleaning system...
    echo [INFO] Clearing npm cache...
    npm cache clean --force
    echo [INFO] Clearing temporary files...
    del /q /f %temp%\* 2>nul
    echo [SUCCESS] System cleaned!
    pause
    goto :optimization
)
if "%opt_choice%"=="0" goto :menu
goto :optimization

:backup
echo.
echo ================================
echo Backup & Restore
echo ================================
echo.
echo [1] Backup Database
echo [2] Backup Code
echo [3] Restore Database
echo [4] Restore Code
echo [0] Back to Main Menu
echo.
set /p backup_choice="Enter your choice (0-4): "

if "%backup_choice%"=="1" (
    echo [INFO] Creating database backup...
    set backup_name=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.sql
    mysql -u jitdhana -piT12345$ esp_tracker > %backup_name%
    echo [SUCCESS] Database backup created: %backup_name%
    pause
    goto :backup
)
if "%backup_choice%"=="2" (
    echo [INFO] Creating code backup...
    set backup_name=code_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.zip
    powershell Compress-Archive -Path . -DestinationPath %backup_name% -Force
    echo [SUCCESS] Code backup created: %backup_name%
    pause
    goto :backup
)
if "%backup_choice%"=="3" (
    echo [INFO] Restoring database...
    echo Please select backup file to restore...
    pause
    goto :backup
)
if "%backup_choice%"=="4" (
    echo [INFO] Restoring code...
    echo Please select backup file to restore...
    pause
    goto :backup
)
if "%backup_choice%"=="0" goto :menu
goto :backup

:exit
echo.
echo ================================
echo Thank you for using WorkplanV5!
echo ================================
echo.
echo [INFO] System management tool closed.
echo [INFO] Remember to:
echo - Save your work before closing
echo - Commit changes to Git
echo - Backup important data
echo.
pause
exit /b 0 