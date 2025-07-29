@echo off
REM 🔍 Check Backend API
REM สำหรับตรวจสอบ backend API

echo.
echo ================================
echo Check Backend API
echo ================================
echo.

echo [INFO] Checking backend API...
echo.

REM Step 1: Check if backend is running
echo [STEP 1] Check Backend Status
echo ================================
echo [INFO] Checking if backend is running...

curl -s http://localhost:3101 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Backend is not running
    echo [INFO] Starting backend server...
    cd backend
    start "Backend Server" cmd /k "npm start"
    cd ..
    echo [INFO] Backend server started
    echo [INFO] Please wait a moment...
    timeout /t 5 >nul
) else (
    echo [SUCCESS] Backend is running
)
echo.

REM Step 2: Test API endpoints
echo [STEP 2] Test API Endpoints
echo ================================
echo [INFO] Testing API endpoints...

echo [TEST 1] Test root endpoint...
curl -s http://localhost:3101
echo.

echo [TEST 2] Test users endpoint...
curl -s http://localhost:3101/api/users
echo.

echo [TEST 3] Test machines endpoint...
curl -s http://localhost:3101/api/machines
echo.

echo [TEST 4] Test production-rooms endpoint...
curl -s http://localhost:3101/api/production-rooms
echo.

echo [TEST 5] Test process-steps endpoint...
curl -s http://localhost:3101/api/process-steps
echo.

REM Step 3: Check database connection
echo [STEP 3] Check Database Connection
echo ================================
echo [INFO] Checking database connection...

cd backend
node -e "
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'jitdhana',
      password: process.env.DB_PASSWORD || 'iT12345$',
      database: process.env.DB_NAME || 'esp_tracker',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Database connection successful!');
    
    // Test users table
    const [users] = await connection.execute('SELECT * FROM users LIMIT 5');
    console.log('✅ Users table accessible, count:', users.length);
    
    // Test machines table
    const [machines] = await connection.execute('SELECT * FROM machines LIMIT 5');
    console.log('✅ Machines table accessible, count:', machines.length);
    
    // Test production_rooms table
    const [rooms] = await connection.execute('SELECT * FROM production_rooms LIMIT 5');
    console.log('✅ Production rooms table accessible, count:', rooms.length);
    
    await connection.end();
  } catch (error) {
    console.log('❌ Database connection failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    console.log('Errno:', error.errno);
  }
}

testConnection();
"
cd ..
echo.

REM Step 4: Create API test script
echo [STEP 4] Create API Test Script
echo ================================
echo [INFO] Creating API test script...

(
echo @echo off
echo REM 🧪 API Test Script
echo echo.
echo echo ================================
echo echo API Test Script
echo echo ================================
echo echo.
echo echo [INFO] Testing API endpoints...
echo echo.
echo echo [TEST 1] Users API...
echo curl -s http://localhost:3101/api/users
echo echo.
echo echo [TEST 2] Machines API...
echo curl -s http://localhost:3101/api/machines
echo echo.
echo echo [TEST 3] Production Rooms API...
echo curl -s http://localhost:3101/api/production-rooms
echo echo.
echo echo [TEST 4] Process Steps API...
echo curl -s http://localhost:3101/api/process-steps
echo echo.
echo echo [INFO] Expected response format:
echo echo { "success": true, "data": [...] }
echo echo.
echo pause
) > test-api.bat

echo [SUCCESS] API test script created: test-api.bat
echo.

REM Step 5: Create fix script
echo [STEP 5] Create Fix Script
echo ================================
echo [INFO] Creating fix script...

(
echo @echo off
echo REM 🛠️ API Fix Script
echo echo.
echo echo ================================
echo echo API Fix Script
echo echo ================================
echo echo.
echo echo [INFO] Fixing API issues...
echo echo.
echo echo [STEP 1] Check database connection...
echo call check-existing-database.bat
echo echo.
echo echo [STEP 2] Restart backend...
echo cd backend
echo start "Backend Fix" cmd /k "npm start"
echo cd ..
echo echo.
echo echo [STEP 3] Test API...
echo timeout /t 3 ^>nul
echo call test-api.bat
echo echo.
echo echo [STEP 4] Test frontend...
echo cd frontend
echo start "Frontend Test" cmd /k "npm run dev"
echo cd ..
echo echo.
echo echo [INFO] Test steps:
echo echo 1. Check API responses
echo echo 2. Open http://localhost:3011
echo echo 3. Test Modal Edit Draft
echo echo 4. Check users dropdown
echo echo.
echo pause
) > fix-api.bat

echo [SUCCESS] API fix script created: fix-api.bat
echo.

echo ================================
echo ✅ Backend API Check Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Run: test-api.bat
echo 2. Run: fix-api.bat
echo 3. Check API responses
echo 4. Test frontend dropdowns
echo.
echo [TROUBLESHOOTING]
echo If API doesn't work:
echo 1. Check database connection
echo 2. Check backend logs
echo 3. Check environment variables
echo 4. Restart backend server
echo.
pause 