@echo off
echo 🧪 Testing system with IP 192.168.0.94
echo ====================================

echo.
echo 🔍 Testing Backend API...
curl -s http://192.168.0.94:3101/api/users >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend API is responding
) else (
    echo ❌ Backend API is not responding
    echo    Make sure backend server is running
)

echo.
echo 🔍 Testing Backend Health...
curl -s http://192.168.0.94:3101 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend server is accessible
) else (
    echo ❌ Backend server is not accessible
    echo    Check if port 3101 is open and server is running
)

echo.
echo 🌐 Testing Frontend...
echo    Please manually check: http://192.168.0.94:3011
echo    Frontend should load in your browser

echo.
echo 📋 Connection Summary:
echo    Backend:  http://192.168.0.94:3101
echo    Frontend: http://192.168.0.94:3011
echo    Database: localhost:3306

echo.
echo 🔧 If tests fail, check:
echo    1. Both servers are running
echo    2. Firewall allows ports 3101 and 3011
echo    3. MySQL database is accessible
echo    4. Environment files are configured correctly

echo.
pause