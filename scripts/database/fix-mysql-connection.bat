@echo off
REM 🗄️ MySQL Connection Fix Script
REM สำหรับแก้ไขปัญหา MySQL connection

echo.
echo ================================
echo MySQL Connection Fix
echo ================================
echo.

echo [INFO] Fixing MySQL connection issues...
echo [INFO] This will help resolve "Access denied" errors
echo.

REM Step 1: Check MySQL Status
echo [STEP 1] Checking MySQL Status
echo ================================
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL is not installed or not in PATH
    echo [SOLUTION] Install MySQL first
    echo [INFO] Download from: https://dev.mysql.com/downloads/installer/
    pause
    exit /b 1
)

echo [SUCCESS] MySQL is installed
echo.

REM Step 2: Test MySQL Connection
echo [STEP 2] Testing MySQL Connection
echo ================================
echo [INFO] Testing connection with current settings...

cd backend
if exist .env (
    echo [INFO] Found existing .env file
    echo [INFO] Current settings:
    findstr "DB_" .env
) else (
    echo [WARNING] No .env file found
)

echo.
echo [INFO] Testing MySQL connection...
mysql -u root -p -e "SELECT 1;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] MySQL connection failed
    echo [INFO] This could be due to:
    echo 1. Wrong password
    echo 2. MySQL service not running
    echo 3. User permissions
    echo.
) else (
    echo [SUCCESS] MySQL connection works
)
cd ..
echo.

REM Step 3: Create MySQL Setup Script
echo [STEP 3] Creating MySQL Setup Script
echo ================================
echo [INFO] Creating MySQL setup script...

(
echo -- MySQL Setup Script
echo -- Run this in MySQL to fix connection issues
echo.
echo -- Create database if not exists
echo CREATE DATABASE IF NOT EXISTS esp_tracker;
echo.
echo -- Use the database
echo USE esp_tracker;
echo.
echo -- Grant permissions to root user
echo GRANT ALL PRIVILEGES ON esp_tracker.* TO 'root'@'localhost';
echo FLUSH PRIVILEGES;
echo.
echo -- Show current user
echo SELECT USER^(^), HOST^(^) FROM mysql.user WHERE USER = 'root';
echo.
echo -- Test connection
echo SELECT 1 as test;
echo.
echo -- Show databases
echo SHOW DATABASES;
echo.
echo -- Show tables in esp_tracker
echo SHOW TABLES FROM esp_tracker;
) > mysql_setup.sql

echo [SUCCESS] MySQL setup script created: mysql_setup.sql
echo.

REM Step 4: Create Environment File
echo [STEP 4] Creating Environment File
echo ================================
echo [INFO] Creating backend environment file...

cd backend
(
echo # MySQL Connection Settings
echo DB_HOST=localhost
echo DB_USER=root
echo DB_PASSWORD=your_mysql_password_here
echo DB_NAME=esp_tracker
echo DB_PORT=3306
echo PORT=3101
echo NODE_ENV=production
echo FRONTEND_URL=http://localhost:3011
echo API_RATE_LIMIT=1000
) > .env

echo [SUCCESS] Environment file created: backend\.env
echo [IMPORTANT] Please edit backend\.env and set your MySQL password
cd ..
echo.

REM Step 5: Create MySQL Reset Script
echo [STEP 5] Creating MySQL Reset Script
echo ================================
echo [INFO] Creating MySQL password reset script...

(
echo @echo off
echo REM 🔐 MySQL Password Reset Script
echo echo.
echo echo ================================
echo echo MySQL Password Reset
echo echo ================================
echo echo.
echo echo [INFO] This will help reset MySQL root password
echo echo.
echo echo [STEP 1] Stop MySQL Service
echo echo net stop mysql
echo echo.
echo echo [STEP 2] Start MySQL in Safe Mode
echo echo mysqld --skip-grant-tables --user=mysql
echo echo.
echo echo [STEP 3] Connect to MySQL
echo echo mysql -u root
echo echo.
echo echo [STEP 4] Reset Password
echo echo USE mysql;
echo echo UPDATE user SET authentication_string=PASSWORD^('new_password'^) WHERE User='root';
echo echo FLUSH PRIVILEGES;
echo echo EXIT;
echo echo.
echo echo [STEP 5] Restart MySQL Service
echo echo net start mysql
echo echo.
echo echo [STEP 6] Test Connection
echo echo mysql -u root -p
echo echo.
echo pause
) > reset-mysql-password.bat

echo [SUCCESS] MySQL password reset script created: reset-mysql-password.bat
echo.

REM Step 6: Create Test Connection Script
echo [STEP 6] Creating Test Connection Script
echo ================================
echo [INFO] Creating MySQL test script...

(
echo @echo off
echo REM 🧪 MySQL Connection Test Script
echo echo.
echo echo ================================
echo echo MySQL Connection Test
echo echo ================================
echo echo.
echo echo [INFO] Testing MySQL connection...
echo echo.
echo echo [STEP 1] Test without password
echo mysql -u root -e "SELECT 1;"
echo echo.
echo echo [STEP 2] Test with password prompt
echo mysql -u root -p -e "SELECT 1;"
echo echo.
echo echo [STEP 3] Test database access
echo mysql -u root -p -e "USE esp_tracker; SHOW TABLES;"
echo echo.
echo echo [STEP 4] Test user permissions
echo mysql -u root -p -e "SHOW GRANTS FOR 'root'@'localhost';"
echo echo.
echo pause
) > test-mysql-connection.bat

echo [SUCCESS] MySQL test script created: test-mysql-connection.bat
echo.

REM Step 7: Troubleshooting Guide
echo [STEP 7] Troubleshooting Guide
echo ================================
echo [INFO] Common MySQL connection issues and solutions:
echo.
echo [PROBLEM 1: Access denied for user 'root'@'localhost']
echo SOLUTION:
echo 1. Check MySQL password in backend\.env
echo 2. Run: test-mysql-connection.bat
echo 3. Reset password: reset-mysql-password.bat
echo 4. Or create new user: mysql -u root -p
echo.
echo [PROBLEM 2: MySQL service not running]
echo SOLUTION:
echo 1. Start MySQL service: net start mysql
echo 2. Or restart: net stop mysql && net start mysql
echo.
echo [PROBLEM 3: Database not exists]
echo SOLUTION:
echo 1. Run: mysql -u root -p ^< mysql_setup.sql
echo 2. Or create manually: CREATE DATABASE esp_tracker;
echo.
echo [PROBLEM 4: Wrong port]
echo SOLUTION:
echo 1. Check MySQL port: netstat -an ^| findstr 3306
echo 2. Update DB_PORT in backend\.env
echo.

echo ================================
echo ✅ MySQL Connection Fix Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Edit backend\.env with your MySQL password
echo 2. Test connection: test-mysql-connection.bat
echo 3. Setup database: mysql -u root -p ^< mysql_setup.sql
echo 4. Restart backend: pm2 restart workplan-backend
echo.
echo [TROUBLESHOOTING]
echo - If password wrong: reset-mysql-password.bat
echo - If service not running: net start mysql
echo - If database missing: mysql_setup.sql
echo.
pause 