@echo off
REM 🗄️ MySQL Client Fix Script
REM สำหรับติดตั้ง MySQL client และแก้ไขปัญหา connection

echo.
echo ================================
echo MySQL Client Fix
echo ================================
echo.

echo [INFO] Fixing MySQL client and connection issues...
echo.

REM Step 1: Check MySQL Client
echo [STEP 1] Checking MySQL Client Installation
echo ================================
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL client is not installed
    echo [INFO] Installing MySQL client...
    echo.
    echo [OPTION 1] Download MySQL Installer
    echo [INFO] Download from: https://dev.mysql.com/downloads/installer/
    echo [INFO] Choose "mysql-installer-community" for Windows
    echo [INFO] Install only "MySQL Client" component
    echo.
    echo [OPTION 2] Use alternative connection method
    echo [INFO] We'll use Node.js to test connection instead
    echo.
    goto :use_nodejs
) else (
    echo [SUCCESS] MySQL client is installed
    mysql --version
    goto :test_connection
)
echo.

:use_nodejs
echo [STEP 2] Using Node.js for Connection Test
echo ================================
echo [INFO] Testing connection using Node.js...

cd backend
node -e "
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing connection to 192.168.0.94:3306...');
  
  try {
    const connection = await mysql.createConnection({
      host: '192.168.0.94',
      user: 'jitdhana',
      password: 'iT12345$',
      port: 3306,
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000
    });
    
    console.log('✅ Connection successful!');
    await connection.end();
  } catch (error) {
    console.log('❌ Connection failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    console.log('Errno:', error.errno);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solution: MySQL is not running on 192.168.0.94');
      console.log('💡 Action: Start MySQL service on remote server');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Solution: Wrong username/password');
      console.log('💡 Action: Check credentials on remote server');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Solution: Cannot resolve hostname');
      console.log('💡 Action: Check IP address and network');
    }
  }
}

testConnection();
"

cd ..
echo.

:test_connection
echo [STEP 3] Network Troubleshooting
echo ================================
echo [INFO] Checking network connectivity...

echo [INFO] Testing ping to 192.168.0.94...
ping -n 1 192.168.0.94 >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Network connectivity is OK
) else (
    echo [ERROR] Cannot reach 192.168.0.94
    echo [SOLUTION] Check network connection and IP address
    pause
    exit /b 1
)

echo [INFO] Testing port 3306...
telnet 192.168.0.94 3306 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Port 3306 is not accessible
    echo [SOLUTION] MySQL is not running on remote server
    echo [ACTION] Start MySQL service on 192.168.0.94
) else (
    echo [SUCCESS] Port 3306 is accessible
)
echo.

REM Step 4: Create Connection Test Script
echo [STEP 4] Creating Connection Test Script
echo ================================
echo [INFO] Creating Node.js connection test script...

(
echo const mysql = require^('mysql2/promise'^);
echo.
echo async function testConnection^(^) {
echo   try {
echo     console.log^('🔍 Testing MySQL connection...'^);
echo     console.log^('Host: 192.168.0.94'^);
echo     console.log^('User: jitdhana'^);
echo     console.log^('Database: esp_tracker'^);
echo.
echo     const connection = await mysql.createConnection^({
echo       host: '192.168.0.94',
echo       user: 'jitdhana',
echo       password: 'iT12345$',
echo       database: 'esp_tracker',
echo       port: 3306,
echo       connectTimeout: 60000,
echo       acquireTimeout: 60000,
echo       timeout: 60000
echo     }^);
echo.
echo     console.log^('✅ Connection successful!'^);
echo.
echo     // Test query
echo     const [rows] = await connection.execute^('SELECT 1 as test'^);
echo     console.log^('✅ Query test successful!'^);
echo.
echo     await connection.end^(^);
echo   } catch ^(error^) {
echo     console.log^('❌ Connection failed:'^);
echo     console.log^('Error:', error.message^);
echo     console.log^('Code:', error.code^);
echo     console.log^('Errno:', error.errno^);
echo   }
echo }
echo.
echo testConnection^(^);
) > test-mysql-connection.js

echo [SUCCESS] Connection test script created: test-mysql-connection.js
echo.

REM Step 5: Create Troubleshooting Guide
echo [STEP 5] Troubleshooting Guide
echo ================================
echo [INFO] Based on the test results:
echo.

echo [IF PORT 3306 IS NOT ACCESSIBLE]
echo SOLUTION: Start MySQL on remote server (192.168.0.94)
echo 1. Connect to 192.168.0.94
echo 2. Run: net start mysql
echo 3. Or install MySQL if not installed
echo.

echo [IF MYSQL CLIENT NOT INSTALLED]
echo SOLUTION: Install MySQL client
echo 1. Download MySQL Installer
echo 2. Install only "MySQL Client" component
echo 3. Or use Node.js connection test
echo.

echo [IF CONNECTION FAILS]
echo SOLUTION: Check remote MySQL configuration
echo 1. On 192.168.0.94, run: setup-remote-mysql-server.bat
echo 2. Check MySQL bind-address setting
echo 3. Check firewall settings
echo 4. Verify user permissions
echo.

echo [QUICK FIXES]
echo 1. Test connection: node test-mysql-connection.js
echo 2. Check MySQL service: net start mysql (on remote)
echo 3. Check firewall: netsh advfirewall firewall add rule name="MySQL" dir=in action=allow protocol=TCP localport=3306
echo 4. Check MySQL config: bind-address = 0.0.0.0
echo.

REM Step 6: Create Quick Fix Script
echo [STEP 6] Creating Quick Fix Script
echo ================================
echo [INFO] Creating quick fix script...

(
echo @echo off
echo REM 🚀 Quick MySQL Connection Fix
echo echo.
echo echo ================================
echo echo Quick MySQL Connection Fix
echo echo ================================
echo echo.
echo echo [INFO] Testing MySQL connection with Node.js...
echo echo.
echo node test-mysql-connection.js
echo echo.
echo echo [INFO] If connection fails, check remote server:
echo echo 1. Connect to 192.168.0.94
echo echo 2. Run: net start mysql
echo echo 3. Run: setup-remote-mysql-server.bat
echo echo.
echo pause
) > quick-mysql-fix.bat

echo [SUCCESS] Quick fix script created: quick-mysql-fix.bat
echo.

echo ================================
echo ✅ MySQL Client Fix Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Test connection: node test-mysql-connection.js
echo 2. If it fails, check remote server (192.168.0.94)
echo 3. Start MySQL service on remote server
echo 4. Run setup-remote-mysql-server.bat on remote server
echo.
echo [QUICK TEST]
echo Run: quick-mysql-fix.bat
echo.
pause 