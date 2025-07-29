@echo off
REM 🌐 Network Access Test Script
REM สำหรับทดสอบการเข้าถึงระบบจากเครื่องอื่น

echo.
echo ================================
echo Network Access Test
echo ================================
echo.

REM Get current IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP: =%

echo [INFO] Current IP Address: %IP%
echo [INFO] Testing network access...
echo.

echo [STEP 1] Testing Local Access
echo ================================
echo [INFO] Testing localhost access...

REM Test localhost access
curl -s -o nul -w "Local Frontend: %%{http_code}\n" http://localhost:3011
curl -s -o nul -w "Local Backend: %%{http_code}\n" http://localhost:3101/api

echo.
echo [STEP 2] Testing Network Access
echo ================================
echo [INFO] Testing network IP access...

REM Test network IP access
curl -s -o nul -w "Network Frontend: %%{http_code}\n" http://%IP%:3011
curl -s -o nul -w "Network Backend: %%{http_code}\n" http://%IP%:3101/api

echo.
echo [STEP 3] Checking Services Status
echo ================================
pm2 status

echo.
echo [STEP 4] Network Information
echo ================================
echo [INFO] Network access URLs:
echo.
echo Local Access:
echo - Frontend: http://localhost:3011
echo - Backend: http://localhost:3101
echo.
echo Network Access:
echo - Frontend: http://%IP%:3011
echo - Backend: http://%IP%:3101
echo.

echo [STEP 5] Troubleshooting Guide
echo ================================
echo [INFO] If network access doesn't work:
echo.
echo 1. Check Windows Firewall:
echo    - Open Windows Defender Firewall
echo    - Check if ports 3011 and 3101 are allowed
echo.
echo 2. Check Antivirus:
echo    - Temporarily disable antivirus
echo    - Add exceptions for the application
echo.
echo 3. Test from another device:
echo    - Open browser on another device
echo    - Try: http://%IP%:3011
echo.
echo 4. Check network connectivity:
echo    - Run: ping %IP%
echo    - Ensure devices are on same network
echo.
echo 5. Restart services:
echo    - pm2 restart all
echo.

echo [STEP 6] Quick Commands
echo ================================
echo [INFO] Useful commands for network access:
echo.
echo View current IP:
echo ipconfig ^| findstr "IPv4"
echo.
echo Test connectivity:
echo ping %IP%
echo.
echo Check open ports:
echo netstat -an ^| findstr ":3011"
echo netstat -an ^| findstr ":3101"
echo.
echo Restart services:
echo pm2 restart all
echo.
echo View logs:
echo pm2 logs
echo.

echo ================================
echo ✅ Network Access Test Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Test from another device: http://%IP%:3011
echo 2. If it doesn't work, run: setup-network-access.bat
echo 3. Check firewall and antivirus settings
echo 4. Restart services if needed: pm2 restart all
echo.
pause 