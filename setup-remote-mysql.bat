@echo off
REM 🗄️ Remote MySQL Setup Script
REM สำหรับตั้งค่า MySQL connection ที่อยู่บนเครื่องอื่น

echo.
echo ================================
echo Remote MySQL Setup
echo ================================
echo.

echo [INFO] Setting up remote MySQL connection...
echo [INFO] Database: 192.168.0.94
echo [INFO] User: jitdhana
echo [INFO] Password: iT12345$
echo.

REM Step 1: Test Network Connectivity
echo [STEP 1] Testing Network Connectivity
echo ================================
echo [INFO] Testing connection to remote MySQL server...

ping -n 1 192.168.0.94 >nul
if %errorlevel% neq 0 (
    echo [ERROR] Cannot reach 192.168.0.94
    echo [SOLUTION] Check network connection and IP address
    pause
    exit /b 1
)

echo [SUCCESS] Network connectivity to 192.168.0.94 is OK
echo.

REM Step 2: Test MySQL Connection
echo [STEP 2] Testing MySQL Connection
echo ================================
echo [INFO] Testing MySQL connection to remote server...

mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "SELECT 1;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] MySQL connection failed
    echo [INFO] This could be due to:
    echo 1. Wrong credentials
    echo 2. MySQL not running on remote server
    echo 3. Firewall blocking connection
    echo 4. MySQL not configured for remote access
    echo.
    echo [TROUBLESHOOTING]
    echo 1. Check if MySQL is running on 192.168.0.94
    echo 2. Verify credentials: jitdhana / iT12345$
    echo 3. Check MySQL bind-address setting
    echo 4. Check firewall on both machines
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] MySQL connection to remote server works!
echo.

REM Step 3: Test Database Access
echo [STEP 3] Testing Database Access
echo ================================
echo [INFO] Testing access to esp_tracker database...

mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "USE esp_tracker; SELECT 1;" 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Cannot access esp_tracker database
    echo [INFO] Creating database if it doesn't exist..."
    mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "CREATE DATABASE IF NOT EXISTS esp_tracker;"
    if %errorlevel% neq 0 (
        echo [ERROR] Cannot create database
        echo [SOLUTION] Check user permissions on remote MySQL
        pause
        exit /b 1
    )
    echo [SUCCESS] Database esp_tracker created
) else (
    echo [SUCCESS] Database esp_tracker exists and accessible
)
echo.

REM Step 4: Import Database Schema
echo [STEP 4] Importing Database Schema
echo ================================
echo [INFO] Importing database schema to remote server...

if exist "backend\esp_tracker (6).sql" (
    echo [INFO] Found database schema file
    mysql -h 192.168.0.94 -u jitdhana -piT12345$ esp_tracker < "backend\esp_tracker (6).sql"
    if %errorlevel% neq 0 (
        echo [WARNING] Could not import schema
        echo [INFO] Tables might already exist or permissions issue
    ) else (
        echo [SUCCESS] Database schema imported
    )
) else (
    echo [WARNING] Database schema file not found
    echo [INFO] You may need to create tables manually
)
echo.

REM Step 5: Create Environment File
echo [STEP 5] Creating Environment File
echo ================================
echo [INFO] Creating backend environment file for remote MySQL...

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
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '192.168.0.94',
      user: process.env.DB_USER || 'jitdhana',
      password: process.env.DB_PASSWORD || 'iT12345$',
      database: process.env.DB_NAME || 'esp_tracker',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Remote database connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database query test successful!');
    
    await connection.end();
  } catch (error) {
    console.log('❌ Remote database connection failed:');
    console.log(error.message);
  }
}

testConnection();
"

cd ..
echo.

REM Step 7: Create Connection Test Script
echo [STEP 7] Creating Connection Test Script
echo ================================
echo [INFO] Creating remote MySQL test script...

(
echo @echo off
echo REM 🧪 Remote MySQL Connection Test
echo echo.
echo echo ================================
echo echo Remote MySQL Connection Test
echo echo ================================
echo echo.
echo echo [INFO] Testing remote MySQL connection...
echo echo.
echo echo [STEP 1] Test network connectivity
echo ping -n 1 192.168.0.94
echo echo.
echo echo [STEP 2] Test MySQL connection
echo mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "SELECT 1;"
echo echo.
echo echo [STEP 3] Test database access
echo mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "USE esp_tracker; SHOW TABLES;"
echo echo.
echo echo [STEP 4] Test user permissions
echo mysql -h 192.168.0.94 -u jitdhana -piT12345$ -e "SHOW GRANTS FOR 'jitdhana'@'%%';"
echo echo.
echo pause
) > test-remote-mysql.bat

echo [SUCCESS] Remote MySQL test script created: test-remote-mysql.bat
echo.

REM Step 8: Final Instructions
echo [STEP 8] Final Instructions
echo ================================
echo [INFO] Remote MySQL setup complete!
echo.
echo [CONNECTION DETAILS]
echo Host: 192.168.0.94
echo User: jitdhana
echo Password: iT12345$
echo Database: esp_tracker
echo.
echo [IF CONNECTION SUCCESSFUL]
echo 1. Restart backend: pm2 restart workplan-backend
echo 2. Or start manually: cd backend && npm start
echo.
echo [IF CONNECTION FAILED]
echo 1. Check network connectivity to 192.168.0.94
echo 2. Verify MySQL credentials
echo 3. Check MySQL remote access settings
echo 4. Run: test-remote-mysql.bat
echo.
echo [TROUBLESHOOTING]
echo - Network issues: Check both machines are on same network
echo - MySQL issues: Check MySQL bind-address and user permissions
echo - Firewall issues: Allow port 3306 on both machines
echo.

echo ================================
echo ✅ Remote MySQL Setup Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. If connection works: Restart backend
echo 2. If connection fails: Check network and MySQL settings
echo 3. Test system: http://localhost:3011
echo.
pause 