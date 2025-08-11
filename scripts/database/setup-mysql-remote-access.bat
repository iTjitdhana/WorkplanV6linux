@echo off
echo ========================================
echo Setting up MySQL for Remote Access
echo ========================================
echo.

echo ⚠️  WARNING: This script will modify MySQL configuration
echo    to allow remote connections from other IPs
echo.
echo 📋 This script will:
echo    1. Grant privileges to user jitdhana from any IP
echo    2. Check MySQL bind-address configuration
echo    3. Restart MySQL service if needed
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo ❌ Operation cancelled
    pause
    exit /b
)

echo.
echo 🔧 Step 1: Connecting to MySQL as root...
echo.

echo Please enter MySQL root password when prompted:
mysql -u root -p -e "
-- Grant privileges to jitdhana from any IP
GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'%' IDENTIFIED BY 'iT12345$';

-- Grant privileges to jitdhana from localhost (backup)
GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'localhost' IDENTIFIED BY 'iT12345$';

-- Grant privileges to jitdhana from specific IPs
GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'192.168.0.161' IDENTIFIED BY 'iT12345$';
GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'192.168.0.94' IDENTIFIED BY 'iT12345$';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show current users and their hosts
SELECT User, Host FROM mysql.user WHERE User = 'jitdhana';

-- Show privileges for jitdhana
SHOW GRANTS FOR 'jitdhana'@'%';
"

if %errorlevel% neq 0 (
    echo ❌ Failed to execute MySQL commands
    echo 💡 Please check:
    echo    1. MySQL root password is correct
    echo    2. MySQL service is running
    echo    3. You have sufficient privileges
    pause
    exit /b
)

echo.
echo ✅ Step 1 completed successfully!
echo.

echo 🔧 Step 2: Checking MySQL configuration...
echo.

echo 📋 Current MySQL configuration:
echo.

echo Checking bind-address setting...
findstr /i "bind-address" "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" 2>nul
if %errorlevel% neq 0 (
    echo Checking alternative MySQL config location...
    findstr /i "bind-address" "C:\Program Files\MySQL\MySQL Server 8.0\my.ini" 2>nul
)

echo.
echo 💡 If bind-address is set to 127.0.0.1, you need to change it to 0.0.0.0
echo    Edit the MySQL configuration file and change:
echo    bind-address = 127.0.0.1
echo    to:
echo    bind-address = 0.0.0.0
echo.

echo 🔧 Step 3: Testing remote connection...
echo.

echo Testing connection from this machine to 192.168.0.94...
mysql -h 192.168.0.94 -u jitdhana -piT12345$ esp_tracker -e "SELECT 1 as test;" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Remote connection test successful!
) else (
    echo ❌ Remote connection test failed
    echo 💡 Please check:
    echo    1. MySQL bind-address is set to 0.0.0.0
    echo    2. Windows Firewall allows port 3306
    echo    3. MySQL service is running
)

echo.
echo 🎉 Setup completed!
echo.
echo 📋 Next steps:
echo    1. If connection test failed, restart MySQL service
echo    2. Run test-remote-database.bat to verify
echo    3. Run start-production-remote-db.bat to start server
echo.

pause 