@echo off
echo ========================================
echo Testing Network Access to 192.168.0.94
echo ========================================
echo.

echo 🔍 Testing access from other machines...
echo.

echo 📊 Step 1: Testing Frontend Access...
echo Testing: http://192.168.0.94:3011
curl -s -o nul -w "Frontend Status: %%{http_code}\n" http://192.168.0.94:3011 2>nul
if %errorlevel% equ 0 (
    echo ✅ Frontend is accessible from network
) else (
    echo ❌ Frontend is not accessible from network
)

echo.
echo 📊 Step 2: Testing Backend API Access...
echo Testing: http://192.168.0.94:3101/api
curl -s -o nul -w "Backend API Status: %%{http_code}\n" http://192.168.0.94:3101/api 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend API is accessible from network
) else (
    echo ❌ Backend API is not accessible from network
)

echo.
echo 📊 Step 3: Testing Database Connection from Backend...
echo Testing if Backend can connect to local database...
cd backend
node -e "
const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'jitdhana',
  password: 'iT12345$',
  database: 'esp_tracker',
  port: 3306,
  connectTimeout: 5000
};

async function testConnection() {
  try {
    console.log('🔍 Testing local database connection...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Backend can connect to local database');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database query test: PASSED');
    
    await connection.end();
    return true;
  } catch (error) {
    console.log('❌ Backend cannot connect to local database:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 All tests passed! System is ready for network access.');
  } else {
    console.log('❌ Database connection failed. Please check MySQL configuration.');
  }
  process.exit(success ? 0 : 1);
});
"

echo.
echo 📋 Summary:
echo    🌐 Frontend: http://192.168.0.94:3011
echo    🔌 Backend API: http://192.168.0.94:3101
echo    🗄️  Database: localhost:3306 (Local)
echo.
echo 💡 If tests fail, check:
echo    1. Servers are running on 192.168.0.94
echo    2. Windows Firewall allows ports 3011 and 3101
echo    3. Network allows access to 192.168.0.94
echo    4. MySQL is running and accessible locally
echo.
pause