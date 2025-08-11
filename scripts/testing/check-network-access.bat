@echo off
echo ========================================
echo    WorkplanV6 Network Access Check
echo ========================================
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r /c:"IPv4 Address"') do (
    set LOCAL_IP=%%a
    goto :found_ip
)
:found_ip
set LOCAL_IP=%LOCAL_IP: =%

echo Your local IP address: %LOCAL_IP%
echo.

echo Checking network connectivity...
echo.

REM Check if ports are open
echo Testing Frontend (Port 3011)...
netstat -an | findstr ":3011" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo ❌ Frontend port 3011 is NOT listening
) else (
    echo ✅ Frontend port 3011 is listening
)

echo Testing Backend (Port 3101)...
netstat -an | findstr ":3101" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo ❌ Backend port 3101 is NOT listening
) else (
    echo ✅ Backend port 3101 is listening
)

echo.
echo Checking Windows Firewall rules...
netsh advfirewall firewall show rule name="WorkplanV6 Frontend" >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend firewall rule NOT found
) else (
    echo ✅ Frontend firewall rule exists
)

netsh advfirewall firewall show rule name="WorkplanV6 Backend" >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend firewall rule NOT found
) else (
    echo ✅ Backend firewall rule exists
)

echo.
echo ========================================
echo    Network Access Summary
echo ========================================
echo.
echo Local access URLs:
echo Frontend: http://localhost:3011
echo Backend:  http://localhost:3101
echo.
echo Network access URLs:
echo Frontend: http://%LOCAL_IP%:3011
echo Backend:  http://%LOCAL_IP%:3101
echo.
echo Troubleshooting:
echo 1. Make sure services are running
echo 2. Run start-network-access.bat if firewall rules are missing
echo 3. Check that both devices are on the same network
echo 4. Try accessing from another device using the network URLs
echo.
pause
