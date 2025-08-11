@echo off
REM 🔍 MySQL Services Check
REM สำหรับตรวจสอบ MySQL services ทั้งหมด

echo.
echo ================================
echo MySQL Services Check
echo ================================
echo.

echo [INFO] Checking all MySQL services...
echo.

REM Step 1: List all services
echo [STEP 1] All Services
echo ================================
echo [INFO] Listing all services...

sc query | findstr /i mysql
if %errorlevel% neq 0 (
    echo [ERROR] No MySQL services found
    echo [INFO] Checking for common MySQL service names...
) else (
    echo [SUCCESS] Found MySQL services above
)
echo.

REM Step 2: Check specific MySQL services
echo [STEP 2] Specific MySQL Services
echo ================================
echo [INFO] Checking specific MySQL service names...

set MYSQL_SERVICES=mysql MySQL80 MySQL8.0 MySQL8 MySQL MySQL80 MySQL8.0

for %%s in (%MYSQL_SERVICES%) do (
    echo [CHECKING] Service: %%s
    sc query %%s >nul 2>&1
    if !errorlevel! equ 0 (
        echo [FOUND] Service exists: %%s
        sc query %%s | findstr "RUNNING"
        if !errorlevel! equ 0 (
            echo [STATUS] Service is RUNNING
        ) else (
            echo [STATUS] Service is NOT RUNNING
        )
    ) else (
        echo [NOT FOUND] Service: %%s
    )
    echo.
)

REM Step 3: Check MySQL processes
echo [STEP 3] MySQL Processes
echo ================================
echo [INFO] Checking MySQL processes...

tasklist | findstr /i mysql
if %errorlevel% neq 0 (
    echo [INFO] No MySQL processes found
) else (
    echo [SUCCESS] Found MySQL processes above
)
echo.

REM Step 4: Check MySQL port
echo [STEP 4] MySQL Port Check
echo ================================
echo [INFO] Checking MySQL port 3306...

netstat -an | findstr ":3306"
if %errorlevel% neq 0 (
    echo [ERROR] MySQL port 3306 not listening
) else (
    echo [SUCCESS] MySQL port 3306 is listening
)
echo.

REM Step 5: Check MySQL installation
echo [STEP 5] MySQL Installation Check
echo ================================
echo [INFO] Checking MySQL installation...

mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL client not found in PATH
    echo [INFO] Checking common MySQL installation paths...
    
    if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
        echo [FOUND] MySQL at: C:\Program Files\MySQL\MySQL Server 8.0\bin\
    ) else if exist "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe" (
        echo [FOUND] MySQL at: C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\
    ) else (
        echo [ERROR] MySQL not found in common paths
    )
) else (
    echo [SUCCESS] MySQL client found in PATH
    mysql --version
)
echo.

REM Step 6: Check MySQL Workbench connection
echo [STEP 6] MySQL Workbench Connection
echo ================================
echo [INFO] Checking if MySQL Workbench can connect...

echo [INFO] Please check MySQL Workbench:
echo 1. Open MySQL Workbench
echo 2. Check if "Local instance MySQL80" connection exists
echo 3. Try to connect to localhost:3306
echo 4. Note the connection details
echo.

REM Step 7: Create connection test
echo [STEP 7] Connection Test
echo ================================
echo [INFO] Creating connection test script...

(
echo @echo off
echo REM 🔍 MySQL Connection Test
echo echo.
echo echo ================================
echo echo MySQL Connection Test
echo ================================
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

REM Step 8: Create fix script
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
echo echo [INFO] Please run as administrator
echo net start MySQL80
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
echo ✅ MySQL Services Check Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Test connections: test-mysql-connections.bat
echo 2. Fix issues: fix-mysql-issues.bat
echo 3. Check MySQL Workbench connection
echo 4. Start backend: cd backend ^&^& npm start
echo.
echo [QUICK FIX]
echo Run: fix-mysql-issues.bat
echo.
pause 