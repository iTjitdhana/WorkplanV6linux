@echo off
chcp 65001 >nul
echo 🔧 Fixing Network Access Issues
echo ==============================
echo.

echo Step 1: Stopping existing servers...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Stopped all Node.js processes
echo.

echo Step 2: Adding Windows Firewall Rules...
echo Adding rule for Frontend (Port 3011)...
netsh advfirewall firewall add rule name="ESP Tracker Frontend" dir=in action=allow protocol=TCP localport=3011 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Frontend firewall rule added
) else (
    echo ⚠️  Frontend firewall rule may already exist or need admin rights
)

echo Adding rule for Backend (Port 3101)...
netsh advfirewall firewall add rule name="ESP Tracker Backend" dir=in action=allow protocol=TCP localport=3101 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend firewall rule added
) else (
    echo ⚠️  Backend firewall rule may already exist or need admin rights
)
echo.

echo Step 3: Starting servers with network access...
echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo Waiting for Backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"
echo.

echo ✅ Servers started with network access enabled!
echo.
echo 🌐 Access from any device on network:
echo    Frontend: http://192.168.0.94:3011
echo    Backend:  http://192.168.0.94:3101
echo.
echo 🔍 Test from another computer:
echo    1. Open browser on another computer
echo    2. Go to: http://192.168.0.94:3011
echo    3. Should work now!
echo.

pause