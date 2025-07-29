@echo off
REM 🔍 MySQL Connection Debug Script
REM สำหรับ debug ปัญหา MySQL connection

echo.
echo ================================
echo MySQL Connection Debug
echo ================================
echo.

echo [INFO] Debugging MySQL connection to 192.168.0.94...
echo.

REM Step 1: Network Diagnostics
echo [STEP 1] Network Diagnostics
echo ================================
echo [INFO] Testing network connectivity...

echo [INFO] Pinging 192.168.0.94...
ping -n 3 192.168.0.94

echo.
echo [INFO] Checking if port 3306 is open...
telnet 192.168.0.94 3306 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Port 3306 is not accessible
    echo [SOLUTION] Check if MySQL is running on remote server
) else (
    echo [SUCCESS] Port 3306 is accessible
)
echo.

REM Step 2: MySQL Client Test
echo [STEP 2] MySQL Client Test
echo ================================
echo [INFO] Testing different MySQL connection methods...

echo [TEST 1] Testing without password...
mysql -h 192.168.0.94 -u jitdhana -e "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Connection works without password
    goto :password_test
) else (
    echo [FAILED] Connection failed without password
)

echo [TEST 2] Testing with password prompt...
echo [INFO] Please enter password when prompted...
mysql -h 192.168.0.94 -u jitdhana -p -e "SELECT 1;"
if %errorlevel% equ 0 (
    echo [SUCCESS] Connection works with password prompt
    goto :password_test
) else (
    echo [FAILED] Connection failed with password prompt
)

echo [TEST 3] Testing with password in command...
mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Connection works with password in command
    goto :password_test
) else (
    echo [FAILED] Connection failed with password in command
)

echo [TEST 4] Testing with different password...
mysql -h 192.168.0.94 -u jitdhana -proot -e "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Connection works with password 'root'
    goto :password_test
) else (
    echo [FAILED] Connection failed with password 'root'
)

echo [TEST 5] Testing with empty password...
mysql -h 192.168.0.94 -u jitdhana -p"" -e "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Connection works with empty password
    goto :password_test
) else (
    echo [FAILED] Connection failed with empty password
)

echo [ERROR] All connection tests failed
echo [SOLUTION] Check MySQL server configuration
pause
exit /b 1

:password_test
echo.
echo [SUCCESS] Found working MySQL connection method
echo.

REM Step 3: Database Access Test
echo [STEP 3] Database Access Test
echo ================================
echo [INFO] Testing database access...

echo [TEST 1] Testing database creation...
mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "CREATE DATABASE IF NOT EXISTS esp_tracker;" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Can create database
) else (
    echo [WARNING] Cannot create database - permission issue
)

echo [TEST 2] Testing database access...
mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "USE esp_tracker; SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Can access esp_tracker database
) else (
    echo [ERROR] Cannot access esp_tracker database
)

echo [TEST 3] Testing table creation...
mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "USE esp_tracker; CREATE TABLE IF NOT EXISTS test_table (id INT);" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Can create tables
    mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "USE esp_tracker; DROP TABLE test_table;" 2>nul
) else (
    echo [WARNING] Cannot create tables - permission issue
)
echo.

REM Step 4: User Permissions Test
echo [STEP 4] User Permissions Test
echo ================================
echo [INFO] Checking user permissions...

mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "SHOW GRANTS FOR 'jitdhana'@'%';" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Can view user grants
) else (
    echo [WARNING] Cannot view user grants
)

mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "SHOW GRANTS FOR 'jitdhana'@'localhost';" 2>nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Can view localhost grants
) else (
    echo [WARNING] Cannot view localhost grants
)
echo.

REM Step 5: Create Working Environment File
echo [STEP 5] Creating Working Environment File
echo ================================
echo [INFO] Creating backend environment file with working settings...

cd backend
(
echo # Remote MySQL Connection Settings
echo DB_HOST=192.168.0.94
echo DB_USER=jitdhana
echo DB_PASSWORD=iT12345$
echo DB_NAME=esp_tracker
echo DB_PORT=3306
echo PORT=3101
echo NODE_ENV=production
echo FRONTEND_URL=http://localhost:3011
echo API_RATE_LIMIT=1000
) > .env

echo [SUCCESS] Environment file created: backend\.env
cd ..
echo.

REM Step 6: Test Node.js Connection
echo [STEP 6] Testing Node.js Connection
echo ================================
echo [INFO] Testing database connection from Node.js...

cd backend
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔍 Testing Node.js connection to remote MySQL...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '192.168.0.94',
      user: process.env.DB_USER || 'jitdhana',
      password: process.env.DB_PASSWORD || 'iT12345$',
      database: process.env.DB_NAME || 'esp_tracker',
      port: process.env.DB_PORT || 3306,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000
    });
    
    console.log('✅ Node.js connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database query test successful!');
    
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

REM Step 7: Troubleshooting Guide
echo [STEP 7] Troubleshooting Guide
echo ================================
echo [INFO] Based on the test results, here are solutions:
echo.
echo [IF NETWORK FAILS]
echo 1. Check if 192.168.0.94 is the correct IP
echo 2. Ensure both machines are on same network
echo 3. Check firewall settings on both machines
echo.
echo [IF MYSQL CONNECTION FAILS]
echo 1. Check if MySQL is running on 192.168.0.94
echo 2. Verify MySQL credentials
echo 3. Check MySQL bind-address setting
echo 4. Check MySQL user permissions
echo.
echo [IF DATABASE ACCESS FAILS]
echo 1. Create database: CREATE DATABASE esp_tracker;
echo 2. Grant permissions: GRANT ALL ON esp_tracker.* TO 'jitdhana'@'%';
echo 3. Import schema: mysql -h 192.168.0.94 -u jitdhana -p esp_tracker < schema.sql
echo.
echo [COMMON SOLUTIONS]
echo 1. On remote MySQL server, run:
echo    mysql -u root -p
echo    CREATE USER IF NOT EXISTS 'jitdhana'@'%%' IDENTIFIED BY 'iT12345$';
echo    GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'%%';
echo    FLUSH PRIVILEGES;
echo.
echo 2. Check MySQL configuration:
echo    Edit /etc/mysql/mysql.conf.d/mysqld.cnf
echo    Set: bind-address = 0.0.0.0
echo    Restart: sudo systemctl restart mysql
echo.

echo ================================
echo ✅ MySQL Connection Debug Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. If connection works: Restart backend
echo 2. If connection fails: Follow troubleshooting guide
echo 3. Test system: http://localhost:3011
echo.
pause 