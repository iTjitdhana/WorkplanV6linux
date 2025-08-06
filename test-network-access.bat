@echo off
chcp 65001 >nul
echo 🌐 Testing Network Access Configuration
echo =====================================
echo.

echo Step 1: Checking current network configuration...
ipconfig | findstr "IPv4"
echo.

echo Step 2: Checking if ports are available...
echo Checking port 3011 (Frontend):
netstat -an | findstr :3011
echo.
echo Checking port 3101 (Backend):
netstat -an | findstr :3101
echo.

echo Step 3: Checking Windows Firewall status...
netsh advfirewall show allprofiles state
echo.

echo Step 4: Testing if servers are running...
echo Testing Backend API (http://localhost:3101/api):
curl -s -o nul -w "%%{http_code}" http://localhost:3101/api
echo.
echo Testing Frontend (http://localhost:3011):
curl -s -o nul -w "%%{http_code}" http://localhost:3011
echo.

echo 📋 Network Access Instructions:
echo ================================
echo.
echo ✅ Server IP: 192.168.0.94
echo ✅ Frontend URL: http://192.168.0.94:3011
echo ✅ Backend API: http://192.168.0.94:3101
echo.
echo 🔥 If still can't access from other machines:
echo 1. Check Windows Firewall settings
echo 2. Add firewall rules for ports 3011 and 3101
echo 3. Restart both servers using start-both.bat
echo.
echo 🛡️ Add Firewall Rules (Run as Administrator):
echo netsh advfirewall firewall add rule name="Node.js Frontend" dir=in action=allow protocol=TCP localport=3011
echo netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=3101
echo.

pause