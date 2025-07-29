@echo off
REM 🔍 Check Existing Database
REM สำหรับตรวจสอบ database และ user ที่มีอยู่แล้ว

echo.
echo ================================
echo Check Existing Database
echo ================================
echo.

echo [INFO] Checking existing MySQL database and user...
echo.

REM Step 1: Check MySQL connection
echo [STEP 1] MySQL Connection Check
echo ================================
echo [INFO] Testing MySQL connection...

mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL client not found
    echo [SOLUTION] Add MySQL to PATH or use MySQL Workbench
    goto :mysql_not_found
) else (
    echo [SUCCESS] MySQL client found
    mysql --version
)
echo.

REM Step 2: List all databases
echo [STEP 2] Database List
echo ================================
echo [INFO] Listing all databases...

mysql -u root -p -e "SHOW DATABASES;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to MySQL
    echo [INFO] Trying without password...
    mysql -u root -e "SHOW DATABASES;" 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Cannot connect to MySQL
        echo [SOLUTION] Check MySQL Workbench connection
        goto :mysql_connection_failed
    )
)
echo.

REM Step 3: List all users
echo [STEP 3] User List
echo ================================
echo [INFO] Listing all users...

mysql -u root -p -e "SELECT User, Host FROM mysql.user;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Cannot check users
    echo [INFO] Trying without password...
    mysql -u root -e "SELECT User, Host FROM mysql.user;" 2>nul
)
echo.

REM Step 4: Check specific database
echo [STEP 4] ESP Tracker Database Check
echo ================================
echo [INFO] Checking esp_tracker database...

mysql -u root -p -e "USE esp_tracker; SHOW TABLES;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Cannot access esp_tracker database
    echo [INFO] Trying without password...
    mysql -u root -e "USE esp_tracker; SHOW TABLES;" 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] esp_tracker database not found
        echo [INFO] Checking other databases...
        mysql -u root -p -e "SHOW DATABASES;" 2>nul
        if %errorlevel% neq 0 (
            mysql -u root -e "SHOW DATABASES;" 2>nul
        )
        echo [SOLUTION] Check database name in MySQL Workbench
        goto :database_not_found
    )
) else (
    echo [SUCCESS] esp_tracker database found
)
echo.

REM Step 5: Check specific user
echo [STEP 5] Jitdhana User Check
echo ================================
echo [INFO] Checking jitdhana user...

mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User='jitdhana';" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Cannot check jitdhana user
    echo [INFO] Trying without password...
    mysql -u root -e "SELECT User, Host FROM mysql.user WHERE User='jitdhana';" 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] jitdhana user not found
        echo [INFO] Checking all users...
        mysql -u root -e "SELECT User, Host FROM mysql.user;" 2>nul
        echo [SOLUTION] Check user name in MySQL Workbench
        goto :user_not_found
    )
) else (
    echo [SUCCESS] jitdhana user found
)
echo.

REM Step 6: Test user connection
echo [STEP 6] User Connection Test
echo ================================
echo [INFO] Testing jitdhana user connection...

mysql -u jitdhana -piT12345$ -e "SELECT 1;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] jitdhana user connection failed
    echo [INFO] This might be due to wrong password
    echo [SOLUTION] Check password in MySQL Workbench
    goto :wrong_password
) else (
    echo [SUCCESS] jitdhana user connection successful
)
echo.

REM Step 7: Test database access
echo [STEP 7] Database Access Test
echo ================================
echo [INFO] Testing database access with jitdhana user...

mysql -u jitdhana -piT12345$ esp_tracker -e "SHOW TABLES;" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Cannot access esp_tracker database with jitdhana user
    echo [SOLUTION] Check user permissions
    goto :permission_issue
) else (
    echo [SUCCESS] Database access successful
)
echo.

REM Step 8: Test Node.js connection
echo [STEP 8] Node.js Connection Test
echo ================================
echo [INFO] Testing Node.js connection...

cd backend
node -e "
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing Node.js connection to existing database...');
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

REM Step 9: Create environment file
echo [STEP 9] Environment File Creation
echo ================================
echo [INFO] Creating backend/.env file...

(
echo # Existing Database Configuration
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

REM Step 10: Create connection guide
echo [STEP 10] Connection Guide
echo ================================
echo [INFO] Creating connection guide...

(
echo # MySQL Connection Guide
echo.
echo ## Database Details
echo - Database Name: esp_tracker
echo - Username: jitdhana
echo - Password: iT12345$
echo - Host: localhost
echo - Port: 3306
echo.
echo ## MySQL Workbench Connection
echo 1. Open MySQL Workbench
echo 2. Use existing connection or create new
echo 3. Hostname: localhost
echo 4. Port: 3306
echo 5. Username: jitdhana
echo 6. Password: iT12345$
echo.
echo ## Backend Configuration
echo - Environment file: backend/.env
echo - Database connection configured
echo - Ready to start backend
echo.
echo ## Next Steps
echo 1. Start backend: cd backend ^&^& npm start
echo 2. Start frontend: cd frontend ^&^& npm run dev
echo 3. Access: http://localhost:3011
echo.
) > mysql-connection-guide.txt

echo [SUCCESS] Connection guide created: mysql-connection-guide.txt
echo.

echo ================================
echo ✅ Database Check Complete!
echo ================================
echo.
echo [SUMMARY]
echo - Database: esp_tracker ✓
echo - User: jitdhana ✓
echo - Connection: Working ✓
echo - Environment: Configured ✓
echo.
echo [NEXT STEPS]
echo 1. Start backend: cd backend ^&^& npm start
echo 2. Start frontend: cd frontend ^&^& npm run dev
echo 3. Access: http://localhost:3011
echo.
echo [QUICK START]
echo Run: cd backend ^&^& npm start
echo.
pause
exit /b 0

:mysql_not_found
echo [ERROR] MySQL client not found
echo [SOLUTION] Add MySQL to PATH
echo 1. Open System Properties
echo 2. Click "Environment Variables"
echo 3. Edit "Path" variable
echo 4. Add: C:\Program Files\MySQL\MySQL Server 8.0\bin
echo 5. Restart Command Prompt
echo.
pause
exit /b 1

:mysql_connection_failed
echo [ERROR] Cannot connect to MySQL
echo [SOLUTION] Check MySQL connection
echo 1. Open MySQL Workbench
echo 2. Check connection details
echo 3. Note the root password
echo 4. Try connecting manually
echo.
pause
exit /b 1

:database_not_found
echo [ERROR] esp_tracker database not found
echo [SOLUTION] Check database name
echo 1. Open MySQL Workbench
echo 2. Check database name (might be different)
echo 3. Note the exact database name
echo 4. Update backend/.env with correct name
echo.
pause
exit /b 1

:user_not_found
echo [ERROR] jitdhana user not found
echo [SOLUTION] Check user name
echo 1. Open MySQL Workbench
echo 2. Check user name (might be different)
echo 3. Note the exact username
echo 4. Update backend/.env with correct username
echo.
pause
exit /b 1

:wrong_password
echo [ERROR] Wrong password for jitdhana user
echo [SOLUTION] Check password
echo 1. Open MySQL Workbench
echo 2. Check user password
echo 3. Note the exact password
echo 4. Update backend/.env with correct password
echo.
pause
exit /b 1

:permission_issue
echo [ERROR] Permission issue
echo [SOLUTION] Check user permissions
echo 1. Open MySQL Workbench
echo 2. Connect as root
echo 3. Check user permissions
echo 4. Grant necessary permissions
echo.
pause
exit /b 1 