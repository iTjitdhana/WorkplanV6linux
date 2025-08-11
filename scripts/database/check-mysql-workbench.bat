@echo off
REM 🔍 MySQL Workbench Connection Check
REM สำหรับตรวจสอบและแก้ไขปัญหา MySQL Workbench connection

echo.
echo ================================
echo MySQL Workbench Connection Check
echo ================================
echo.

echo [INFO] Checking MySQL Workbench connection...
echo.

REM Step 1: Check MySQL Service Status
echo [STEP 1] MySQL Service Status
echo ================================
echo [INFO] Checking MySQL service status...

sc query mysql >nul 2>&1
if %errorlevel% neq 0 (
    sc query MySQL80 >nul 2>&1
    if %errorlevel% neq 0 (
        sc query MySQL8.0 >nul 2>&1
        if %errorlevel% neq 0 (
            echo [ERROR] MySQL service not found
            echo [SOLUTION] Install MySQL Server
            goto :install_mysql
        ) else (
            set MYSQL_SERVICE=MySQL8.0
        )
    ) else (
        set MYSQL_SERVICE=MySQL80
    )
) else (
    set MYSQL_SERVICE=mysql
)

echo [INFO] Found MySQL service: %MYSQL_SERVICE%

sc query %MYSQL_SERVICE% | findstr "RUNNING"
if %errorlevel% neq 0 (
    echo [ERROR] MySQL service is not running
    echo [INFO] Starting MySQL service...
    net start %MYSQL_SERVICE% 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to start MySQL service
        echo [SOLUTION] Run as administrator
        goto :admin_required
    ) else (
        echo [SUCCESS] MySQL service started
    )
) else (
    echo [SUCCESS] MySQL service is running
)
echo.

REM Step 2: Check MySQL Port
echo [STEP 2] MySQL Port Check
echo ================================
echo [INFO] Checking MySQL port 3306...

netstat -an | findstr ":3306"
if %errorlevel% neq 0 (
    echo [ERROR] MySQL port 3306 not listening
    echo [SOLUTION] MySQL service not running or wrong port
    goto :check_mysql_config
) else (
    echo [SUCCESS] MySQL port 3306 is listening
)
echo.

REM Step 3: Test MySQL Connection
echo [STEP 3] MySQL Connection Test
echo ================================
echo [INFO] Testing MySQL connection...

mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL client not found in PATH
    echo [SOLUTION] Add MySQL to PATH
    goto :add_mysql_path
) else (
    echo [SUCCESS] MySQL client found
    mysql --version
)
echo.

REM Step 4: Test Root Connection
echo [STEP 4] Root Connection Test
echo ================================
echo [INFO] Testing root connection...

mysql -u root -p -e "SELECT 1;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Root connection failed
    echo [INFO] This might be due to password or permissions
    echo [SOLUTION] Check root password in MySQL Workbench
    goto :check_root_password
) else (
    echo [SUCCESS] Root connection successful
)
echo.

REM Step 5: Check Database and User
echo [STEP 5] Database and User Check
echo ================================
echo [INFO] Checking database and user...

mysql -u root -p -e "
SELECT 
    'Database Check' as check_type,
    CASE 
        WHEN SCHEMA_NAME = 'esp_tracker' THEN 'EXISTS'
        ELSE 'NOT FOUND'
    END as esp_tracker_db
FROM INFORMATION_SCHEMA.SCHEMATA 
WHERE SCHEMA_NAME = 'esp_tracker';

SELECT 
    'User Check' as check_type,
    User,
    Host,
    CASE 
        WHEN User = 'jitdhana' THEN 'EXISTS'
        ELSE 'NOT FOUND'
    END as jitdhana_user
FROM mysql.user 
WHERE User = 'jitdhana';
" 2>nul

if %errorlevel% neq 0 (
    echo [ERROR] Failed to check database/user
    echo [INFO] Trying without password...
    mysql -u root -e "
    SELECT 
        'Database Check' as check_type,
        CASE 
            WHEN SCHEMA_NAME = 'esp_tracker' THEN 'EXISTS'
            ELSE 'NOT FOUND'
        END as esp_tracker_db
    FROM INFORMATION_SCHEMA.SCHEMATA 
    WHERE SCHEMA_NAME = 'esp_tracker';

    SELECT 
        'User Check' as check_type,
        User,
        Host,
        CASE 
            WHEN User = 'jitdhana' THEN 'EXISTS'
            ELSE 'NOT FOUND'
        END as jitdhana_user
    FROM mysql.user 
    WHERE User = 'jitdhana';
    " 2>nul
)
echo.

REM Step 6: Create MySQL Workbench Connection Guide
echo [STEP 6] MySQL Workbench Connection Guide
echo ================================
echo [INFO] Creating connection guide...

(
echo # MySQL Workbench Connection Guide
echo.
echo ## Connection Settings
echo - Hostname: localhost
echo - Port: 3306
echo - Username: root
echo - Password: [your root password]
echo.
echo ## Alternative Connection Settings
echo - Hostname: localhost
echo - Port: 3306
echo - Username: jitdhana
echo - Password: iT12345$
echo.
echo ## Troubleshooting Steps
echo 1. Open MySQL Workbench
echo 2. Click "+" to add new connection
echo 3. Enter connection details above
echo 4. Test connection
echo 5. If it fails, check:
echo    - MySQL service is running
echo    - Port 3306 is open
echo    - Password is correct
echo    - Firewall settings
echo.
echo ## Common Issues
echo ### Issue: Access denied for user 'root'@'localhost'
echo Solution: Reset root password
echo.
echo ### Issue: Can't connect to MySQL server
echo Solution: Start MySQL service
echo.
echo ### Issue: Connection timeout
echo Solution: Check firewall and port settings
echo.
) > mysql-workbench-guide.txt

echo [SUCCESS] Connection guide created: mysql-workbench-guide.txt
echo.

REM Step 7: Create Connection Test Script
echo [STEP 7] Connection Test Script
echo ================================
echo [INFO] Creating connection test script...

(
echo @echo off
echo REM 🔍 MySQL Connection Test
echo echo.
echo echo ================================
echo echo MySQL Connection Test
echo echo ================================
echo echo.
echo echo [INFO] Testing MySQL connections...
echo echo.
echo echo [TEST 1] Root connection...
echo mysql -u root -p -e "SELECT 'Root connection successful' as status;"
echo echo.
echo echo [TEST 2] jitdhana connection...
echo mysql -u jitdhana -piT12345$ -e "SELECT 'jitdhana connection successful' as status;"
echo echo.
echo echo [TEST 3] Database access...
echo mysql -u jitdhana -piT12345$ esp_tracker -e "SHOW TABLES;"
echo echo.
echo echo [TEST 4] Node.js connection...
echo cd backend
echo node -e "
echo const mysql = require^('mysql2/promise'^);
echo async function test^(^) {
echo   try {
echo     const conn = await mysql.createConnection^({
echo       host: 'localhost',
echo       user: 'jitdhana',
echo       password: 'iT12345$',
echo       database: 'esp_tracker'
echo     }^);
echo     console.log^('✅ Node.js connection successful'^);
echo     await conn.end^(^);
echo   } catch ^(e^) {
echo     console.log^('❌ Node.js connection failed:', e.message^);
echo   }
echo }
echo test^(^);
echo "
echo cd ..
echo echo.
echo pause
) > test-mysql-connections.bat

echo [SUCCESS] Connection test script created: test-mysql-connections.bat
echo.

REM Step 8: Create Fix Script
echo [STEP 8] MySQL Fix Script
echo ================================
echo [INFO] Creating MySQL fix script...

(
echo @echo off
echo REM 🛠️ MySQL Fix Script
echo echo.
echo echo ================================
echo echo MySQL Fix Script
echo ================================
echo echo.
echo echo [INFO] Fixing MySQL issues...
echo echo.
echo echo [STEP 1] Starting MySQL service...
echo net start %MYSQL_SERVICE%
echo echo.
echo echo [STEP 2] Creating database and user...
echo mysql -u root -p -e "
echo CREATE DATABASE IF NOT EXISTS esp_tracker;
echo CREATE USER IF NOT EXISTS 'jitdhana'@'localhost' IDENTIFIED BY 'iT12345$';
echo CREATE USER IF NOT EXISTS 'jitdhana'@'%%' IDENTIFIED BY 'iT12345$';
echo GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'localhost';
echo GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'%%';
echo FLUSH PRIVILEGES;
echo SELECT 'Setup complete' as status;
echo "
echo echo.
echo echo [STEP 3] Testing connections...
echo call test-mysql-connections.bat
echo echo.
echo echo [STEP 4] Creating environment file...
echo (
echo echo DB_HOST=localhost
echo echo DB_USER=jitdhana
echo echo DB_PASSWORD=iT12345$
echo echo DB_NAME=esp_tracker
echo echo DB_PORT=3306
echo echo PORT=3101
echo echo NODE_ENV=development
echo echo FRONTEND_URL=http://localhost:3011
echo ) ^> backend\.env
echo echo.
echo echo ✅ MySQL fix complete!
echo echo.
echo pause
) > fix-mysql-issues.bat

echo [SUCCESS] MySQL fix script created: fix-mysql-issues.bat
echo.

echo ================================
echo ✅ MySQL Workbench Check Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Test connections: test-mysql-connections.bat
echo 2. Fix issues: fix-mysql-issues.bat
echo 3. Check guide: mysql-workbench-guide.txt
echo 4. Open MySQL Workbench and test connection
echo.
echo [QUICK FIX]
echo Run: fix-mysql-issues.bat
echo.
pause
exit /b 0

:install_mysql
echo [ERROR] MySQL not installed
echo [SOLUTION] Install MySQL Server
echo 1. Download MySQL Installer
echo 2. Install "Server only" component
echo 3. Set root password during installation
echo 4. Run this script again
echo.
pause
exit /b 1

:admin_required
echo [ERROR] Administrator privileges required
echo [SOLUTION] Run this script as administrator
echo 1. Right-click on this script
echo 2. Select "Run as administrator"
echo.
pause
exit /b 1

:add_mysql_path
echo [ERROR] MySQL not in PATH
echo [SOLUTION] Add MySQL to PATH
echo 1. Open System Properties
echo 2. Click "Environment Variables"
echo 3. Edit "Path" variable
echo 4. Add: C:\Program Files\MySQL\MySQL Server 8.0\bin
echo 5. Restart Command Prompt
echo.
pause
exit /b 1

:check_root_password
echo [ERROR] Root password issue
echo [SOLUTION] Check root password
echo 1. Open MySQL Workbench
echo 2. Check saved connections
echo 3. Note the root password
echo 4. Or reset root password
echo.
pause
exit /b 1

:check_mysql_config
echo [ERROR] MySQL configuration issue
echo [SOLUTION] Check MySQL configuration
echo 1. Check MySQL service status
echo 2. Check MySQL port settings
echo 3. Check MySQL bind-address
echo 4. Restart MySQL service
echo.
pause
exit /b 1 