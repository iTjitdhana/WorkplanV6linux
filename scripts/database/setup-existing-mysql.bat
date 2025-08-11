@echo off
REM 🗄️ Setup Existing MySQL
REM สำหรับตั้งค่า backend ให้ใช้งาน database และ user ที่มีอยู่แล้ว

echo.
echo ================================
echo Setup Existing MySQL Database
echo ================================
echo.

echo [INFO] Setting up backend to use existing MySQL database...
echo.

REM Step 1: Check MySQL service
echo [STEP 1] MySQL Service Check
echo ================================
echo [INFO] Checking MySQL service...

sc query MySQL80 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL80 service not found
    echo [INFO] Checking other MySQL services...
    sc query MySQL8.0 >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] MySQL8.0 service not found
        echo [SOLUTION] Start MySQL service manually
        goto :start_mysql_manual
    ) else (
        set MYSQL_SERVICE=MySQL8.0
    )
) else (
    set MYSQL_SERVICE=MySQL80
)

echo [SUCCESS] Found MySQL service: %MYSQL_SERVICE%

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

REM Step 2: Check existing databases
echo [STEP 2] Existing Database Check
echo ================================
echo [INFO] Checking existing databases...

mysql -u root -p -e "SHOW DATABASES;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to MySQL
    echo [INFO] Trying without password...
    mysql -u root -e "SHOW DATABASES;" 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Cannot connect to MySQL
        echo [SOLUTION] Check MySQL Workbench connection
        goto :check_mysql_connection
    )
)
echo.

REM Step 3: Check existing users
echo [STEP 3] Existing User Check
echo ================================
echo [INFO] Checking existing users...

mysql -u root -p -e "SELECT User, Host FROM mysql.user;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Cannot check users
    echo [INFO] Trying without password...
    mysql -u root -e "SELECT User, Host FROM mysql.user;" 2>nul
)
echo.

REM Step 4: Check esp_tracker database
echo [STEP 4] ESP Tracker Database Check
echo ================================
echo [INFO] Checking esp_tracker database...

mysql -u root -p -e "USE esp_tracker; SHOW TABLES;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Cannot access esp_tracker database
    echo [INFO] Trying without password...
    mysql -u root -e "USE esp_tracker; SHOW TABLES;" 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] esp_tracker database not found or not accessible
        echo [SOLUTION] Check database name in MySQL Workbench
        goto :check_database_name
    )
)
echo [SUCCESS] esp_tracker database found
echo.

REM Step 5: Test existing user connection
echo [STEP 5] Existing User Connection Test
echo ================================
echo [INFO] Testing connection with existing user...

mysql -u jitdhana -piT12345$ -e "SELECT 1;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] jitdhana user connection failed
    echo [INFO] Checking if user exists...
    mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User='jitdhana';" 2>nul
    if %errorlevel% neq 0 (
        mysql -u root -e "SELECT User, Host FROM mysql.user WHERE User='jitdhana';" 2>nul
    )
    echo [SOLUTION] Check user credentials in MySQL Workbench
    goto :check_user_credentials
) else (
    echo [SUCCESS] jitdhana user connection successful
)
echo.

REM Step 6: Test database access
echo [STEP 6] Database Access Test
echo ================================
echo [INFO] Testing database access...

mysql -u jitdhana -piT12345$ esp_tracker -e "SHOW TABLES;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Cannot access esp_tracker database with jitdhana user
    echo [SOLUTION] Check user permissions
    goto :check_user_permissions
) else (
    echo [SUCCESS] Database access successful
)
echo.

REM Step 7: Test Node.js connection
echo [STEP 7] Node.js Connection Test
echo ================================
echo [INFO] Testing Node.js connection to existing database...

cd backend
node -e "
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing connection to existing database...');
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
    
    console.log('✅ Node.js connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('✅ Database tables found:', rows.length);
    
    await connection.end();
  } catch (error) {
    console.log('❌ Node.js connection failed:');
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
echo [INFO] Creating backend/.env file for existing database...

(
echo # Existing MySQL Database Configuration
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

REM Step 9: Test backend connection
echo [STEP 9] Backend Connection Test
echo ================================
echo [INFO] Testing backend connection...

cd backend
node -e "
const mysql = require('mysql2/promise');

async function testBackendConnection() {
  console.log('🔍 Testing backend database connection...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'jitdhana',
      password: process.env.DB_PASSWORD || 'iT12345$',
      database: process.env.DB_NAME || 'esp_tracker',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Backend connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Backend query test successful!');
    
    await connection.end();
  } catch (error) {
    console.log('❌ Backend connection failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    console.log('Errno:', error.errno);
  }
}

testBackendConnection();
"

cd ..
echo.

echo ================================
echo ✅ Existing MySQL Setup Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Test backend: cd backend ^&^& npm start
echo 2. Test frontend: cd frontend ^&^& npm run dev
echo 3. Access: http://localhost:3011
echo.
echo [TROUBLESHOOTING]
echo If connection still fails:
echo 1. Check MySQL Workbench connection details
echo 2. Verify database name is 'esp_tracker'
echo 3. Check user credentials
echo 4. Verify user permissions
echo.
pause
exit /b 0

:start_mysql_manual
echo [ERROR] MySQL service not found
echo [SOLUTION] Start MySQL manually
echo 1. Open Services (services.msc)
echo 2. Find MySQL service
echo 3. Start the service
echo 4. Or use MySQL Workbench to connect
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

:check_mysql_connection
echo [ERROR] Cannot connect to MySQL
echo [SOLUTION] Check MySQL connection
echo 1. Open MySQL Workbench
echo 2. Check connection details
echo 3. Note the root password
echo 4. Try connecting manually
echo.
pause
exit /b 1

:check_database_name
echo [ERROR] Database name issue
echo [SOLUTION] Check database name
echo 1. Open MySQL Workbench
echo 2. Check database name (might be different)
echo 3. Note the exact database name
echo 4. Update backend/.env with correct name
echo.
pause
exit /b 1

:check_user_credentials
echo [ERROR] User credentials issue
echo [SOLUTION] Check user credentials
echo 1. Open MySQL Workbench
echo 2. Check user credentials
echo 3. Note the exact username and password
echo 4. Update backend/.env with correct credentials
echo.
pause
exit /b 1

:check_user_permissions
echo [ERROR] User permissions issue
echo [SOLUTION] Check user permissions
echo 1. Open MySQL Workbench
echo 2. Connect as root
echo 3. Check user permissions
echo 4. Grant necessary permissions
echo.
pause
exit /b 1 