@echo off
REM 🗄️ Simple MySQL Setup Script
REM สำหรับตั้งค่า MySQL แบบง่ายๆ

echo.
echo ================================
echo Simple MySQL Setup
echo ================================
echo.

echo [INFO] Setting up MySQL for WorkplanV5...
echo.

REM Step 1: Check MySQL
echo [STEP 1] Checking MySQL Installation
echo ================================
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL is not installed
    echo [SOLUTION] Please install MySQL first
    echo [INFO] Download from: https://dev.mysql.com/downloads/installer/
    echo [INFO] Choose "mysql-installer-community" for Windows
    pause
    exit /b 1
)

echo [SUCCESS] MySQL is installed
mysql --version
echo.

REM Step 2: Start MySQL Service
echo [STEP 2] Starting MySQL Service
echo ================================
echo [INFO] Starting MySQL service...
net start mysql 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Could not start MySQL service
    echo [INFO] MySQL might already be running or need manual start
) else (
    echo [SUCCESS] MySQL service started
)
echo.

REM Step 3: Test MySQL Connection
echo [STEP 3] Testing MySQL Connection
echo ================================
echo [INFO] Testing MySQL connection...
echo [INFO] If prompted for password, try:
echo [INFO] 1. Press Enter (no password)
echo [INFO] 2. Or try common passwords: root, admin, password
echo [INFO] 3. Or check your MySQL installation
echo.

mysql -u root -e "SELECT 1;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] MySQL connection failed
    echo [INFO] Trying with password prompt...
    echo [INFO] Please enter your MySQL root password when prompted
    mysql -u root -p -e "SELECT 1;"
    if %errorlevel% neq 0 (
        echo [ERROR] Still cannot connect to MySQL
        echo [SOLUTION] You may need to reset MySQL password
        echo [INFO] Run: reset-mysql-password.bat
        pause
        exit /b 1
    )
) else (
    echo [SUCCESS] MySQL connection works without password
)

echo [SUCCESS] MySQL connection test passed
echo.

REM Step 4: Create Database
echo [STEP 4] Creating Database
echo ================================
echo [INFO] Creating esp_tracker database...

mysql -u root -e "CREATE DATABASE IF NOT EXISTS esp_tracker;" 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Could not create database without password
    echo [INFO] Trying with password prompt...
    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS esp_tracker;"
    if %errorlevel% neq 0 (
        echo [ERROR] Could not create database
        echo [SOLUTION] Check MySQL permissions
        pause
        exit /b 1
    )
)

echo [SUCCESS] Database esp_tracker created
echo.

REM Step 5: Import Database Schema
echo [STEP 5] Importing Database Schema
echo ================================
echo [INFO] Importing database schema...

if exist "backend\esp_tracker (6).sql" (
    echo [INFO] Found database schema file
    mysql -u root esp_tracker < "backend\esp_tracker (6).sql" 2>nul
    if %errorlevel% neq 0 (
        echo [WARNING] Could not import schema without password
        echo [INFO] Trying with password prompt...
        mysql -u root -p esp_tracker < "backend\esp_tracker (6).sql"
        if %errorlevel% neq 0 (
            echo [ERROR] Could not import database schema
            echo [SOLUTION] Check file path and MySQL permissions
        ) else (
            echo [SUCCESS] Database schema imported
        )
    ) else (
        echo [SUCCESS] Database schema imported
    )
) else (
    echo [WARNING] Database schema file not found
    echo [INFO] You may need to create tables manually
)
echo.

REM Step 6: Create Environment File
echo [STEP 6] Creating Environment File
echo ================================
echo [INFO] Creating backend environment file...

cd backend
(
echo # MySQL Connection Settings
echo DB_HOST=localhost
echo DB_USER=root
echo DB_PASSWORD=
echo DB_NAME=esp_tracker
echo DB_PORT=3306
echo PORT=3101
echo NODE_ENV=production
echo FRONTEND_URL=http://localhost:3011
echo API_RATE_LIMIT=1000
) > .env

echo [SUCCESS] Environment file created: backend\.env
echo [IMPORTANT] If MySQL has password, edit backend\.env and add it
cd ..
echo.

REM Step 7: Test Database Connection
echo [STEP 7] Testing Database Connection
echo ================================
echo [INFO] Testing database connection from Node.js...

cd backend
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'esp_tracker',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Database connection successful!');
    await connection.end();
  } catch (error) {
    console.log('❌ Database connection failed:');
    console.log(error.message);
  }
}

testConnection();
"

cd ..
echo.

REM Step 8: Final Instructions
echo [STEP 8] Final Instructions
echo ================================
echo [INFO] MySQL setup complete!
echo.
echo [IF CONNECTION SUCCESSFUL]
echo 1. Restart backend: pm2 restart workplan-backend
echo 2. Or start manually: cd backend && npm start
echo.
echo [IF CONNECTION FAILED]
echo 1. Check MySQL password in backend\.env
echo 2. Run: test-mysql-connection.bat
echo 3. Reset password: reset-mysql-password.bat
echo.
echo [TESTING]
echo 1. Start backend: cd backend && npm start
echo 2. Check for connection errors
echo 3. If no errors, system is ready
echo.

echo ================================
echo ✅ MySQL Setup Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. If connection works: Restart backend
echo 2. If connection fails: Fix password in backend\.env
echo 3. Test system: http://localhost:3011
echo.
pause 