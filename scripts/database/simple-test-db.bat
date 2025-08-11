@echo off
echo ========================================
echo Simple Database Connection Test
echo ========================================
echo.

echo 🔍 Testing connection to 192.168.0.94:3306...
echo.

cd backend

echo Testing with mysql command line...
mysql -h 192.168.0.94 -u jitdhana -piT12345$ esp_tracker -e "SELECT 1 as test;" 2>nul

if %errorlevel% equ 0 (
    echo ✅ MySQL command line connection successful!
    echo.
    echo 🚀 Now testing with Node.js...
    node test-db-connection.js
) else (
    echo ❌ MySQL command line connection failed!
    echo.
    echo 💡 Please check:
    echo    1. MySQL server is running on 192.168.0.94
    echo    2. User jitdhana has permission to connect from this IP
    echo    3. Firewall allows connection on port 3306
    echo.
    echo 🔧 Run setup-mysql-remote-access.bat to configure MySQL
)

echo.
pause 