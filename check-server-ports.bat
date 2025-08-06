@echo off
echo ========================================
echo Checking Server Ports on 192.168.0.94
echo ========================================
echo.

echo 🔍 Checking if ports are open and accessible...
echo.

echo 📊 Port 3101 (Backend API):
netstat -an | findstr :3101
if %errorlevel% equ 0 (
    echo ✅ Port 3101 is in use (Backend API)
) else (
    echo ❌ Port 3101 is not in use
)

echo.
echo 📊 Port 3011 (Frontend):
netstat -an | findstr :3011
if %errorlevel% equ 0 (
    echo ✅ Port 3011 is in use (Frontend)
) else (
    echo ❌ Port 3011 is not in use
)

echo.
echo 📊 Port 3306 (MySQL Database):
netstat -an | findstr :3306
if %errorlevel% equ 0 (
    echo ✅ Port 3306 is in use (MySQL Database)
) else (
    echo ❌ Port 3306 is not in use
)

echo.
echo 🔍 Testing network connectivity...
echo.

echo Testing Frontend access:
curl -s -o nul -w "Frontend (3011): %%{http_code}\n" http://192.168.0.94:3011 2>nul
if %errorlevel% neq 0 (
    echo ❌ Cannot access Frontend on port 3011
)

echo Testing Backend API access:
curl -s -o nul -w "Backend API (3101): %%{http_code}\n" http://192.168.0.94:3101/api 2>nul
if %errorlevel% neq 0 (
    echo ❌ Cannot access Backend API on port 3101
)

echo.
echo 📋 Summary:
echo    🌐 Frontend: http://192.168.0.94:3011
echo    🔌 Backend API: http://192.168.0.94:3101
echo    🗄️  Database: localhost:3306
echo.
echo 💡 If ports are not accessible, make sure:
echo    1. Servers are running
echo    2. Windows Firewall allows these ports
echo    3. Network allows access to 192.168.0.94
echo.
pause 