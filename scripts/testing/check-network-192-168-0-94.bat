@echo off
echo 🌐 Checking Network Configuration for 192.168.0.94
echo ===============================================

echo.
echo 🔍 Checking IP Configuration...
ipconfig | findstr "192.168.0.94"
if %errorlevel% == 0 (
    echo ✅ IP 192.168.0.94 is configured on this machine
) else (
    echo ❌ IP 192.168.0.94 is NOT found on this machine
    echo    Please configure your network adapter with this IP
)

echo.
echo 🔍 Testing network connectivity...
ping -n 1 192.168.0.94 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ IP 192.168.0.94 is reachable
) else (
    echo ❌ IP 192.168.0.94 is not reachable
    echo    Check network configuration
)

echo.
echo 🔍 Checking if ports are available...
netstat -an | findstr ":3101"
if %errorlevel% == 0 (
    echo ⚠️  Port 3101 is already in use
    netstat -ano | findstr ":3101"
) else (
    echo ✅ Port 3101 is available
)

netstat -an | findstr ":3011"
if %errorlevel% == 0 (
    echo ⚠️  Port 3011 is already in use
    netstat -ano | findstr ":3011"
) else (
    echo ✅ Port 3011 is available
)

echo.
echo 🔍 Checking Windows Firewall...
netsh advfirewall firewall show rule name="Node.js Server" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Firewall rule for Node.js exists
) else (
    echo ⚠️  No specific firewall rule found
    echo    You may need to allow Node.js through firewall
)

echo.
echo 📋 Network Summary:
echo    Target IP: 192.168.0.94
echo    Backend Port: 3101
echo    Frontend Port: 3011
echo    Database Port: 3306 (MySQL)

echo.
echo 🔧 If network tests fail:
echo    1. Configure network adapter with IP 192.168.0.94
echo    2. Check subnet mask and gateway settings
echo    3. Allow Node.js through Windows Firewall
echo    4. Check router/switch configuration

echo.
pause