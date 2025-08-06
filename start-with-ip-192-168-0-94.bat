@echo off
echo 🚀 Starting system with IP 192.168.0.94
echo =====================================

echo.
echo 📋 System Configuration:
echo - Backend: http://192.168.0.94:3101
echo - Frontend: http://192.168.0.94:3011
echo.

echo 🔍 Checking if environment files exist...
if not exist "backend\.env" (
    echo ❌ Backend .env file not found!
    echo Please run setup-ip-192-168-0-94.bat first
    pause
    exit /b 1
)

if not exist "frontend\.env.local" (
    echo ❌ Frontend .env.local file not found!
    echo Please run setup-ip-192-168-0-94.bat first
    pause
    exit /b 1
)

echo ✅ Environment files found
echo.

echo 🔄 Starting backend server...
cd backend
start "Backend Server" cmd /k "npm start"
timeout /t 3

echo 🔄 Starting frontend server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting!
echo.
echo 📱 Access your application at:
echo    http://192.168.0.94:3011
echo.
echo 🔧 Backend API available at:
echo    http://192.168.0.94:3101
echo.
echo ⚠️  Make sure your firewall allows connections on ports 3101 and 3011
echo.
pause