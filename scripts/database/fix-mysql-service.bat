@echo off
REM 🔧 MySQL Service Fix Script
REM สำหรับแก้ไขปัญหา MySQL service detection

echo.
echo ================================
echo MySQL Service Fix
echo ================================
echo.

echo [INFO] Fixing MySQL service detection...
echo.

REM Step 1: Check all possible MySQL services
echo [STEP 1] Checking MySQL Services
echo ================================
echo [INFO] Checking all possible MySQL service names...

set MYSQL_SERVICE_FOUND=0

REM Check common MySQL service names
for %%s in (mysql MySQL80 MySQL8.0 MySQL8 MySQL MySQL80 MySQL8.0) do (
    sc query %%s >nul 2>&1
    if !errorlevel! equ 0 (
        echo [FOUND] MySQL service: %%s
        set MYSQL_SERVICE=%%s
        set MYSQL_SERVICE_FOUND=1
        goto :found_service
    )
)

if %MYSQL_SERVICE_FOUND% equ 0 (
    echo [ERROR] No MySQL service found with common names
    echo [INFO] Checking all services for MySQL...
    
    sc query | findstr /i mysql
    if !errorlevel! equ 0 (
        echo [INFO] Found MySQL-related services above
        echo [SOLUTION] Use the exact service name from above
    ) else (
        echo [ERROR] No MySQL services found
        goto :no_mysql_service
    )
)
echo.

:found_service
echo [SUCCESS] Using MySQL service: %MYSQL_SERVICE%
echo.

REM Step 2: Check service status
echo [STEP 2] Service Status Check
echo ================================
echo [INFO] Checking if MySQL service is running...

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

REM Step 3: Check MySQL port
echo [STEP 3] Port Check
echo ================================
echo [INFO] Checking MySQL port 3306...

netstat -an | findstr ":3306"
if %errorlevel% neq 0 (
    echo [ERROR] MySQL port 3306 not listening
    echo [SOLUTION] MySQL service not running properly
    goto :port_issue
) else (
    echo [SUCCESS] MySQL port 3306 is listening
)
echo.

REM Step 4: Test MySQL connection
echo [STEP 4] Connection Test
echo ================================
echo [INFO] Testing MySQL connection...

mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL client not found in PATH
    echo [INFO] Adding MySQL to PATH...
    goto :add_mysql_path
) else (
    echo [SUCCESS] MySQL client found
    mysql --version
)
echo.

REM Step 5: Test root connection
echo [STEP 5] Root Connection Test
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

REM Step 6: Setup database and user
echo [STEP 6] Database Setup
echo ================================
echo [INFO] Setting up database and user...

mysql -u root -p -e "
CREATE DATABASE IF NOT EXISTS esp_tracker;
CREATE USER IF NOT EXISTS 'jitdhana'@'localhost' IDENTIFIED BY 'iT12345$';
CREATE USER IF NOT EXISTS 'jitdhana'@'%' IDENTIFIED BY 'iT12345$';
GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'localhost';
GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'%';
FLUSH PRIVILEGES;
SELECT 'Database and user setup complete' as status;
" 2>nul

if %errorlevel% neq 0 (
    echo [ERROR] Failed to setup database/user
    echo [INFO] Trying without password...
    mysql -u root -e "
    CREATE DATABASE IF NOT EXISTS esp_tracker;
    CREATE USER IF NOT EXISTS 'jitdhana'@'localhost' IDENTIFIED BY 'iT12345$';
    CREATE USER IF NOT EXISTS 'jitdhana'@'%' IDENTIFIED BY 'iT12345$';
    GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'localhost';
    GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'%';
    FLUSH PRIVILEGES;
    SELECT 'Database and user setup complete' as status;
    " 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to setup database/user
        echo [SOLUTION] Use MySQL Workbench to setup manually
        goto :manual_setup
    )
)
echo [SUCCESS] Database and user setup complete
echo.

REM Step 7: Test application connection
echo [STEP 7] Application Connection Test
echo ================================
echo [INFO] Testing application connection...

cd backend
node -e "
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing application connection...');
  console.log('Host: localhost');
  console.log('User: jitdhana');
  console.log('Database: esp_tracker');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'jitdhana',
      password: 'iT12345$',
      database: 'esp_tracker',
      port: 3306,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000
    });
    
    console.log('✅ Application connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful!');
    
    await connection.end();
  } catch (error) {
    console.log('❌ Application connection failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    console.log('Errno:', error.errno);
  }
}

testConnection();
"

cd ..
echo.

REM Step 8: Create environment file
echo [STEP 8] Environment Setup
echo ================================
echo [INFO] Creating backend/.env file...

(
echo # Local MySQL Configuration
echo DB_HOST=localhost
echo DB_USER=jitdhana
echo DB_PASSWORD=iT12345$
echo DB_NAME=esp_tracker
echo DB_PORT=3306
echo.
echo # Backend Configuration
echo PORT=3101
echo NODE_ENV=development
echo FRONTEND_URL=http://localhost:3011
) > backend\.env

echo [SUCCESS] Environment file created: backend\.env
echo.

REM Step 9: Import database schema
echo [STEP 9] Schema Import
echo ================================
echo [INFO] Importing database schema...

if exist "backend\esp_tracker ^(6^).sql" (
    echo [INFO] Found schema file: esp_tracker (6).sql
    mysql -u jitdhana -piT12345$ esp_tracker < "backend\esp_tracker ^(6^).sql" 2>nul
    if %errorlevel% neq 0 (
        echo [WARNING] Failed to import with jitdhana user
        echo [INFO] Trying with root user...
        mysql -u root -p esp_tracker < "backend\esp_tracker ^(6^).sql" 2>nul
        if %errorlevel% neq 0 (
            echo [WARNING] Failed to import schema
            echo [INFO] You can import manually via MySQL Workbench
        ) else (
            echo [SUCCESS] Schema imported successfully
        )
    ) else (
        echo [SUCCESS] Schema imported successfully
    )
) else (
    echo [INFO] No schema file found
    echo [INFO] You can import schema manually via MySQL Workbench
)
echo.

echo ================================
echo ✅ MySQL Service Fix Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Test backend: cd backend ^&^& npm start
echo 2. Test frontend: cd frontend ^&^& npm run dev
echo 3. Access: http://localhost:3011
echo.
echo [TROUBLESHOOTING]
echo If connection still fails:
echo 1. Check MySQL Workbench connection
echo 2. Verify MySQL service is running
echo 3. Check firewall settings
echo 4. Try different MySQL port
echo.
pause
exit /b 0

:no_mysql_service
echo [ERROR] No MySQL services found
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

:port_issue
echo [ERROR] MySQL port issue
echo [SOLUTION] Check MySQL configuration
echo 1. Check MySQL service status
echo 2. Check MySQL port settings
echo 3. Check MySQL bind-address
echo 4. Restart MySQL service
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

:manual_setup
echo [ERROR] Manual setup required
echo [SOLUTION] Use MySQL Workbench to setup:
echo.
echo 1. Open MySQL Workbench
echo 2. Connect to local MySQL server
echo 3. Run these SQL commands:
echo.
echo CREATE DATABASE IF NOT EXISTS esp_tracker;
echo CREATE USER IF NOT EXISTS 'jitdhana'@'localhost' IDENTIFIED BY 'iT12345$';
echo CREATE USER IF NOT EXISTS 'jitdhana'@'%%' IDENTIFIED BY 'iT12345$';
echo GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'localhost';
echo GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'%%';
echo FLUSH PRIVILEGES;
echo.
echo 4. Import database schema
echo 5. Run this script again
echo.
pause
exit /b 1 