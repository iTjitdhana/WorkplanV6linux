@echo off
REM 🗄️ Local MySQL Fix Script
REM สำหรับแก้ไขปัญหา local MySQL connection

echo.
echo ================================
echo Local MySQL Connection Fix
echo ================================
echo.

echo [INFO] Fixing local MySQL connection issues...
echo.

REM Step 1: Check MySQL Service
echo [STEP 1] Checking MySQL Service
echo ================================
echo [INFO] Checking if MySQL service is running...

sc query mysql >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL service not found
    echo [INFO] Checking for MySQL80 service...
    sc query MySQL80 >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] MySQL80 service not found
        echo [INFO] Checking for MySQL8.0 service...
        sc query MySQL8.0 >nul 2>&1
        if %errorlevel% neq 0 (
            echo [ERROR] MySQL8.0 service not found
            echo [SOLUTION] MySQL service not installed or not running
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

echo [SUCCESS] Found MySQL service: %MYSQL_SERVICE%
echo.

REM Step 2: Start MySQL Service
echo [STEP 2] Starting MySQL Service
echo ================================
echo [INFO] Starting MySQL service...

net start %MYSQL_SERVICE% 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start MySQL service
    echo [INFO] Trying to start as administrator...
    echo [SOLUTION] Run this script as administrator
    goto :admin_required
) else (
    echo [SUCCESS] MySQL service started
)
echo.

REM Step 3: Test MySQL Connection
echo [STEP 3] Testing MySQL Connection
echo ================================
echo [INFO] Testing local MySQL connection...

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

REM Step 4: Test Root Connection
echo [STEP 4] Testing Root Connection
echo ================================
echo [INFO] Testing root connection to MySQL...

mysql -u root -p -e "SELECT 1;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Root connection failed
    echo [INFO] This might be due to password or permissions
    goto :fix_root_access
) else (
    echo [SUCCESS] Root connection successful
)
echo.

REM Step 5: Create Database and User
echo [STEP 5] Setting up Database and User
echo ================================
echo [INFO] Creating database and user...

mysql -u root -p -e "
CREATE DATABASE IF NOT EXISTS esp_tracker;
CREATE USER IF NOT EXISTS 'jitdhana'@'localhost' IDENTIFIED BY 'iT12345$';
CREATE USER IF NOT EXISTS 'jitdhana'@'%' IDENTIFIED BY 'iT12345$';
GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'localhost';
GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'%';
FLUSH PRIVILEGES;
SELECT 'Database and user created successfully' as status;
" 2>nul

if %errorlevel% neq 0 (
    echo [ERROR] Failed to create database/user
    echo [INFO] Trying without password...
    mysql -u root -e "
    CREATE DATABASE IF NOT EXISTS esp_tracker;
    CREATE USER IF NOT EXISTS 'jitdhana'@'localhost' IDENTIFIED BY 'iT12345$';
    CREATE USER IF NOT EXISTS 'jitdhana'@'%' IDENTIFIED BY 'iT12345$';
    GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'localhost';
    GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'%';
    FLUSH PRIVILEGES;
    SELECT 'Database and user created successfully' as status;
    " 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create database/user
        goto :manual_setup
    )
)
echo [SUCCESS] Database and user setup complete
echo.

REM Step 6: Test Application Connection
echo [STEP 6] Testing Application Connection
echo ================================
echo [INFO] Testing connection with application credentials...

cd backend
node -e "
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing local MySQL connection...');
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
    
    console.log('✅ Connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful!');
    
    await connection.end();
  } catch (error) {
    console.log('❌ Connection failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    console.log('Errno:', error.errno);
  }
}

testConnection();
"

cd ..
echo.

REM Step 7: Create Local Environment File
echo [STEP 7] Creating Local Environment File
echo ================================
echo [INFO] Creating backend/.env for local MySQL...

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

echo [SUCCESS] Local environment file created: backend\.env
echo.

REM Step 8: Import Database Schema
echo [STEP 8] Importing Database Schema
echo ================================
echo [INFO] Importing database schema...

if exist "backend\esp_tracker ^(6^).sql" (
    echo [INFO] Found database schema file
    mysql -u jitdhana -piT12345$ esp_tracker < "backend\esp_tracker ^(6^).sql" 2>nul
    if %errorlevel% neq 0 (
        echo [WARNING] Failed to import schema with user credentials
        echo [INFO] Trying with root credentials...
        mysql -u root -p esp_tracker < "backend\esp_tracker ^(6^).sql" 2>nul
        if %errorlevel% neq 0 (
            echo [WARNING] Failed to import schema
            echo [INFO] You may need to import manually via MySQL Workbench
        ) else (
            echo [SUCCESS] Database schema imported
        )
    ) else (
        echo [SUCCESS] Database schema imported
    )
) else (
    echo [INFO] No schema file found
    echo [INFO] You can import schema manually via MySQL Workbench
)
echo.

echo ================================
echo ✅ Local MySQL Fix Complete!
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

:install_mysql
echo [INFO] MySQL not installed
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
echo 3. Or run Command Prompt as administrator
echo.
pause
exit /b 1

:add_mysql_path
echo [INFO] Adding MySQL to PATH...
echo [INFO] Common MySQL installation paths:
echo - C:\Program Files\MySQL\MySQL Server 8.0\bin
echo - C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin
echo.
echo [SOLUTION] Add MySQL to PATH manually:
echo 1. Open System Properties
echo 2. Click "Environment Variables"
echo 3. Edit "Path" variable
echo 4. Add MySQL bin directory
echo 5. Restart Command Prompt
echo.
pause
exit /b 1

:fix_root_access
echo [INFO] Root access issue detected
echo [SOLUTION] Reset MySQL root password
echo.
echo [METHOD 1] Using MySQL Installer
echo 1. Open MySQL Installer
echo 2. Click "Reconfigure" on MySQL Server
echo 3. Set new root password
echo.
echo [METHOD 2] Manual Reset
echo 1. Stop MySQL service
echo 2. Start MySQL in safe mode
echo 3. Reset password
echo 4. Restart MySQL service
echo.
pause
exit /b 1

:manual_setup
echo [INFO] Manual setup required
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