@echo off
echo ========================================
echo    WorkplanV6 Network Access Setup
echo ========================================
echo.

echo Setting up network access for other devices...
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

REM Check Windows Firewall
echo Checking Windows Firewall...
netsh advfirewall firewall show rule name="WorkplanV6 Frontend" >nul 2>&1
if errorlevel 1 (
    echo Adding Windows Firewall rules...
    netsh advfirewall firewall add rule name="WorkplanV6 Frontend" dir=in action=allow protocol=TCP localport=3011
    netsh advfirewall firewall add rule name="WorkplanV6 Backend" dir=in action=allow protocol=TCP localport=3101
    echo Firewall rules added successfully!
) else (
    echo Firewall rules already exist.
)

echo.
echo ========================================
echo    Network Access Setup Complete!
echo ========================================
echo.
echo Your application can now be accessed from other devices:
echo.
echo Local access:
echo Frontend: http://localhost:3011
echo Backend:  http://localhost:3101
echo.
echo Network access:
echo Frontend: http://%LOCAL_IP%:3011
echo Backend:  http://%LOCAL_IP%:3101
echo.
echo Other devices on the same network can access:
echo - Frontend: http://%LOCAL_IP%:3011
echo - Backend:  http://%LOCAL_IP%:3101
echo.
echo Make sure to:
echo 1. Run start-performance-simple.bat to start the services
echo 2. Share the IP addresses with other users
echo 3. Check that both devices are on the same network
echo.
pause
