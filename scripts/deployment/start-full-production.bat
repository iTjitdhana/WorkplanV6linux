@echo off
echo ========================================
echo Starting Full Production System
echo ========================================
echo.

echo 🔧 Step 1: Testing database connection...
call test-remote-database.bat

if %errorlevel% neq 0 (
    echo ❌ Database connection failed! Please fix the issue first.
    echo 💡 Run setup-mysql-remote-access.bat to configure MySQL
    pause
    exit /b
)

echo.
echo ✅ Database connection successful!
echo.

echo 🔧 Step 2: Starting Backend Server...
echo.

start "Backend Server" cmd /k "start-production-remote-db.bat"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 🔧 Step 3: Starting Frontend Server...
echo.

start "Frontend Server" cmd /k "start-frontend-production.bat"

echo.
echo 🎉 Production system is starting!
echo.
echo 📋 System Information:
echo    🌐 Frontend: http://192.168.0.161:3011
echo    🔌 Backend API: http://192.168.0.161:3101
echo    🗄️  Database: 192.168.0.94:3306
echo.
echo 📋 Access from other machines:
echo    - Any machine on the network can access via: http://192.168.0.161:3011
echo    - Backend API is available at: http://192.168.0.161:3101
echo.
echo ⚠️  Note: Both servers are running in separate windows
echo    Close those windows to stop the servers
echo.
pause 