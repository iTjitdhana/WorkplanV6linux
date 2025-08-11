@echo off
REM 🛠️ Production Management Script
REM สำหรับจัดการระบบใน Production Mode

echo.
echo ================================
echo Production Management
echo ================================
echo.

:menu
echo [SELECT OPTION]
echo 1. Start Production Mode
echo 2. Stop All Services
echo 3. Restart All Services
echo 4. View Status
echo 5. View Logs
echo 6. Monitor Performance
echo 7. Backup Database
echo 8. Update System
echo 9. Optimize Performance
echo 10. Exit
echo.
set /p choice="Enter your choice (1-10): "

if "%choice%"=="1" goto start_production
if "%choice%"=="2" goto stop_services
if "%choice%"=="3" goto restart_services
if "%choice%"=="4" goto view_status
if "%choice%"=="5" goto view_logs
if "%choice%"=="6" goto monitor_performance
if "%choice%"=="7" goto backup_database
if "%choice%"=="8" goto update_system
if "%choice%"=="9" goto optimize_performance
if "%choice%"=="10" goto exit
goto menu

:start_production
echo.
echo [STARTING PRODUCTION MODE]
echo ================================
call start-production.bat
goto menu

:stop_services
echo.
echo [STOPPING ALL SERVICES]
echo ================================
pm2 stop all
echo [INFO] All services stopped
pause
goto menu

:restart_services
echo.
echo [RESTARTING ALL SERVICES]
echo ================================
pm2 restart all
echo [INFO] All services restarted
pause
goto menu

:view_status
echo.
echo [SERVICE STATUS]
echo ================================
pm2 status
echo.
echo [SYSTEM RESOURCES]
echo ================================
echo CPU Usage:
wmic cpu get loadpercentage /value
echo.
echo Memory Usage:
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /value
pause
goto menu

:view_logs
echo.
echo [VIEWING LOGS]
echo ================================
echo [SELECT LOG TYPE]
echo 1. Backend Logs
echo 2. Frontend Logs
echo 3. All Logs
echo 4. Error Logs Only
echo 5. Back to Menu
echo.
set /p log_choice="Enter log choice (1-5): "

if "%log_choice%"=="1" (
    pm2 logs workplan-backend
) else if "%log_choice%"=="2" (
    pm2 logs workplan-frontend
) else if "%log_choice%"=="3" (
    pm2 logs
) else if "%log_choice%"=="4" (
    pm2 logs --err
) else if "%log_choice%"=="5" (
    goto menu
)
pause
goto menu

:monitor_performance
echo.
echo [PERFORMANCE MONITORING]
echo ================================
call monitor-performance.bat
goto menu

:backup_database
echo.
echo [BACKING UP DATABASE]
echo ================================
echo [INFO] Creating database backup...
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
mysqldump -u root -p esp_tracker > backup_%timestamp%.sql
echo [SUCCESS] Database backup created: backup_%timestamp%.sql
pause
goto menu

:update_system
echo.
echo [UPDATING SYSTEM]
echo ================================
echo [INFO] Updating from Git repository...
git pull origin main
echo.
echo [INFO] Installing updated dependencies...
cd backend
npm install --production
cd ../frontend
npm install --legacy-peer-deps --production
npm run build
cd ..
echo.
echo [INFO] Restarting services with updates...
pm2 restart all
echo [SUCCESS] System updated and restarted
pause
goto menu

:optimize_performance
echo.
echo [OPTIMIZING PERFORMANCE]
echo ================================
call optimize-performance.bat
goto menu

:exit
echo.
echo [EXITING PRODUCTION MANAGEMENT]
echo ================================
echo [INFO] Thank you for using Production Management
echo [INFO] Services will continue running in background
echo.
pause
exit /b 0 