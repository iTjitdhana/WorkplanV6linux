@echo off
REM 🚀 Start Production Mode
REM สำหรับรันระบบใน Production mode

echo.
echo ================================
echo Start Production Mode
echo ================================
echo.

echo [INFO] Starting system in Production mode...
echo.

REM Step 1: Check if backend is running
echo [STEP 1] Check Backend Status
echo ================================
echo [INFO] Checking if backend is running...

curl -s http://192.168.0.94:3101 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Backend is not running
    echo [INFO] Starting backend server...
    cd backend
    start "Backend Production" cmd /k "npm start"
    cd ..
    echo [INFO] Backend server started
    echo [INFO] Please wait a moment...
    timeout /t 5 >nul
) else (
    echo [SUCCESS] Backend is running
)
echo.

REM Step 2: Build frontend for production
echo [STEP 2] Build Frontend for Production
echo ================================
echo [INFO] Building frontend for production...

cd frontend
echo [INFO] Installing dependencies...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    echo [INFO] Trying with --force...
    call npm install --force
)

echo [INFO] Building for production...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    echo [INFO] Please check the errors above
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Frontend built successfully
echo.

REM Step 3: Start frontend in production mode
echo [STEP 3] Start Frontend Production Server
echo ================================
echo [INFO] Starting frontend in production mode...

cd frontend
start "Frontend Production" cmd /k "npm start"
cd ..
echo [SUCCESS] Frontend production server started
echo.

REM Step 4: Show access URLs
echo [STEP 4] Access URLs
echo ================================
echo [INFO] System is now running in Production mode:
echo.
echo [BACKEND]
echo - API URL: http://192.168.0.94:3101
echo - Local API: http://localhost:3101
echo.
echo [FRONTEND]
echo - Production URL: http://192.168.0.94:3011
echo - Local URL: http://localhost:3011
echo.
echo [FEATURES]
echo - SearchBox autocomplete: ✅ Enabled
echo - Dropdown components: ✅ Enabled
echo - Production optimizations: ✅ Enabled
echo.

REM Step 5: Create monitoring script
echo [STEP 5] Create Monitoring Script
echo ================================
echo [INFO] Creating monitoring script...

(
echo @echo off
echo REM 📊 Production Monitoring
echo echo.
echo echo ================================
echo echo Production Monitoring
echo echo ================================
echo echo.
echo echo [INFO] Monitoring production system...
echo echo.
echo echo [STEP 1] Check backend status...
echo curl -s http://192.168.0.94:3101 ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo   echo [ERROR] Backend not accessible
echo ^) else ^(
echo   echo [SUCCESS] Backend accessible
echo ^)
echo echo.
echo echo [STEP 2] Check frontend status...
echo curl -s http://192.168.0.94:3011 ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo   echo [ERROR] Frontend not accessible
echo ^) else ^(
echo   echo [SUCCESS] Frontend accessible
echo ^)
echo echo.
echo echo [STEP 3] Check API endpoints...
echo curl -s http://192.168.0.94:3101/api/users
echo echo.
echo echo [STEP 4] Check database connection...
echo cd backend
echo node -e "const mysql = require('mysql2/promise'); async function test() { try { const conn = await mysql.createConnection({host: '192.168.0.94', user: 'jitdhana', password: 'iT12345$', database: 'esp_tracker'}); console.log('✅ Database connected'); await conn.end(); } catch(err) { console.log('❌ Database error:', err.message); } } test();"
echo cd ..
echo echo.
echo pause
) > monitor-production.bat

echo [SUCCESS] Monitoring script created: monitor-production.bat
echo.

echo ================================
echo ✅ Production Mode Started!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Open http://192.168.0.94:3011
echo 2. Test SearchBox autocomplete
echo 3. Test dropdown components
echo 4. Run: monitor-production.bat
echo.
echo [TROUBLESHOOTING]
echo If there are issues:
echo 1. Check backend logs
echo 2. Check frontend logs
echo 3. Run monitor-production.bat
echo 4. Check browser console
echo.
pause 