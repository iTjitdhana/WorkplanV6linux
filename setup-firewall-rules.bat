@echo off
echo ========================================
echo Setting up Windows Firewall Rules
echo ========================================
echo.

echo ⚠️  WARNING: This script requires Administrator privileges
echo    to modify Windows Firewall rules
echo.

echo 🔧 Adding firewall rules for network access...
echo.

echo 📊 Adding rule for Frontend (Port 3011)...
netsh advfirewall firewall add rule name="Workplan Frontend" dir=in action=allow protocol=TCP localport=3011
if %errorlevel% equ 0 (
    echo ✅ Frontend firewall rule added successfully
) else (
    echo ❌ Failed to add Frontend firewall rule
    echo 💡 Please run as Administrator
)

echo.
echo 📊 Adding rule for Backend API (Port 3101)...
netsh advfirewall firewall add rule name="Workplan Backend API" dir=in action=allow protocol=TCP localport=3101
if %errorlevel% equ 0 (
    echo ✅ Backend API firewall rule added successfully
) else (
    echo ❌ Failed to add Backend API firewall rule
    echo 💡 Please run as Administrator
)

echo.
echo 📊 Adding rule for MySQL Database (Port 3306)...
netsh advfirewall firewall add rule name="MySQL Database" dir=in action=allow protocol=TCP localport=3306
if %errorlevel% equ 0 (
    echo ✅ MySQL firewall rule added successfully
) else (
    echo ❌ Failed to add MySQL firewall rule
    echo 💡 Please run as Administrator
)

echo.
echo 🔍 Checking current firewall rules...
echo.

echo 📊 Current rules for our ports:
netsh advfirewall firewall show rule name="Workplan Frontend"
netsh advfirewall firewall show rule name="Workplan Backend API"
netsh advfirewall firewall show rule name="MySQL Database"

echo.
echo 📋 Summary:
echo    ✅ Frontend: Port 3011 - Accessible from network
echo    ✅ Backend API: Port 3101 - Accessible from network
echo    ✅ MySQL Database: Port 3306 - Accessible from network
echo.
echo 🌐 Network Access URLs:
echo    Frontend: http://192.168.0.94:3011
echo    Backend API: http://192.168.0.94:3101
echo.
echo 💡 Next steps:
echo    1. Run start-full-server.bat to start servers
echo    2. Run test-network-access.bat to test access
echo    3. Access from other machines via 192.168.0.94
echo.
pause 