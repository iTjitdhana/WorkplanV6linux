@echo off
REM 🗄️ Remote MySQL Server Setup Script
REM สำหรับตั้งค่า MySQL บนเครื่อง remote (192.168.0.94)

echo.
echo ================================
echo Remote MySQL Server Setup
echo ================================
echo.

echo [INFO] This script helps set up MySQL on the remote server (192.168.0.94)
echo [INFO] Run this on the remote server where MySQL is installed
echo.

echo [IMPORTANT] This script should be run on the remote server (192.168.0.94)
echo [IMPORTANT] NOT on the current machine
echo.

echo [STEP 1] MySQL Installation Check
echo ================================
echo [INFO] Checking if MySQL is installed...

mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL is not installed on this machine
    echo [SOLUTION] Install MySQL first:
    echo [INFO] 1. Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
    echo [INFO] 2. Run installer as Administrator
    echo [INFO] 3. Choose "Server only" or "Developer Default"
    echo [INFO] 4. Set root password during installation
    pause
    exit /b 1
)

echo [SUCCESS] MySQL is installed
mysql --version
echo.

echo [STEP 2] MySQL Service Status
echo ================================
echo [INFO] Checking MySQL service status...

net start | findstr "MySQL" >nul
if %errorlevel% neq 0 (
    echo [WARNING] MySQL service is not running
    echo [INFO] Starting MySQL service...
    net start mysql
    if %errorlevel% neq 0 (
        echo [ERROR] Could not start MySQL service
        echo [SOLUTION] Start MySQL manually or check installation
        pause
        exit /b 1
    )
) else (
    echo [SUCCESS] MySQL service is running
)
echo.

echo [STEP 3] MySQL Configuration
echo ================================
echo [INFO] Configuring MySQL for remote access...
echo.

echo [INFO] Creating MySQL configuration script...
(
echo -- MySQL Remote Access Configuration
echo -- Run these commands in MySQL as root
echo.
echo -- Create user for remote access
echo CREATE USER IF NOT EXISTS 'jitdhana'@'%%' IDENTIFIED BY 'iT12345$';
echo.
echo -- Create database
echo CREATE DATABASE IF NOT EXISTS esp_tracker;
echo.
echo -- Grant permissions
echo GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'%%';
echo GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'localhost';
echo.
echo -- Flush privileges
echo FLUSH PRIVILEGES;
echo.
echo -- Show users
echo SELECT User, Host FROM mysql.user WHERE User = 'jitdhana';
echo.
echo -- Show databases
echo SHOW DATABASES;
echo.
echo -- Test user connection
echo SELECT USER^(^), HOST^(^) FROM mysql.user WHERE USER = 'jitdhana';
) > mysql_remote_setup.sql

echo [SUCCESS] MySQL setup script created: mysql_remote_setup.sql
echo.

echo [STEP 4] Running MySQL Setup
echo ================================
echo [INFO] Running MySQL setup commands...
echo [INFO] Please enter MySQL root password when prompted...
echo.

mysql -u root -p < mysql_remote_setup.sql
if %errorlevel% neq 0 (
    echo [ERROR] MySQL setup failed
    echo [SOLUTION] Check MySQL root password and permissions
    pause
    exit /b 1
)

echo [SUCCESS] MySQL setup completed
echo.

echo [STEP 5] Testing Remote Access
echo ================================
echo [INFO] Testing remote access configuration...

echo [TEST 1] Testing local connection with new user...
mysql -u jitdhana -piT12345$ -e "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Local connection works
) else (
    echo [ERROR] Local connection failed
)

echo [TEST 2] Testing database access...
mysql -u jitdhana -piT12345$ -e "USE esp_tracker; SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Database access works
) else (
    echo [ERROR] Database access failed
)
echo.

echo [STEP 6] MySQL Configuration File
echo ================================
echo [INFO] Checking MySQL configuration for remote access...
echo.

echo [INFO] MySQL configuration file locations:
echo [INFO] Windows: C:\ProgramData\MySQL\MySQL Server 8.0\my.ini
echo [INFO] Linux: /etc/mysql/mysql.conf.d/mysqld.cnf
echo.

echo [INFO] Important settings to check:
echo [INFO] 1. bind-address = 0.0.0.0 (or comment out)
echo [INFO] 2. port = 3306
echo [INFO] 3. skip-networking = 0 (or comment out)
echo.

echo [INFO] To allow remote connections, edit MySQL config file:
echo [INFO] 1. Find bind-address line
echo [INFO] 2. Change to: bind-address = 0.0.0.0
echo [INFO] 3. Or comment out: # bind-address = 127.0.0.1
echo [INFO] 4. Restart MySQL service
echo.

echo [STEP 7] Firewall Configuration
echo ================================
echo [INFO] Configuring Windows Firewall for MySQL...
echo.

echo [INFO] Adding firewall rule for MySQL...
netsh advfirewall firewall add rule name="MySQL Server" dir=in action=allow protocol=TCP localport=3306

echo [SUCCESS] Firewall rule added for MySQL
echo.

echo [STEP 8] Final Test
echo ================================
echo [INFO] Testing complete remote access setup...
echo.

echo [INFO] Testing from localhost...
mysql -u jitdhana -piT12345$ -e "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Local MySQL access works
) else (
    echo [ERROR] Local MySQL access failed
)

echo [INFO] Testing database access...
mysql -u jitdhana -piT12345$ -e "USE esp_tracker; SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Database access works
) else (
    echo [ERROR] Database access failed
)
echo.

echo [STEP 9] Connection Information
echo ================================
echo [INFO] MySQL server setup complete!
echo.
echo [CONNECTION DETAILS]
echo Host: 192.168.0.94 (this machine's IP)
echo Port: 3306
echo User: jitdhana
echo Password: iT12345$
echo Database: esp_tracker
echo.
echo [TEST FROM ANOTHER MACHINE]
echo mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "SELECT 1;"
echo.
echo [IMPORTANT NOTES]
echo 1. Make sure both machines are on the same network
echo 2. Check firewall settings on both machines
echo 3. Verify MySQL bind-address setting
echo 4. Test connection from the other machine
echo.

echo ================================
echo ✅ Remote MySQL Server Setup Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Test connection from another machine
echo 2. If it works, go back to the other machine
echo 3. Run: setup-remote-mysql.bat
echo.
pause 