@echo off
echo ========================================
echo Starting Production with Remote Database
echo ========================================
echo.

echo 🔧 Setting up environment variables...
set NODE_ENV=production
set DB_HOST=192.168.0.94
set DB_USER=jitdhana
set DB_PASSWORD=iT12345$
set DB_NAME=esp_tracker
set DB_PORT=3306
set PRODUCTION_HOST=192.168.0.161
set PORT=3101

echo.
echo 📊 Database Configuration:
echo    Host: %DB_HOST%
echo    User: %DB_USER%
echo    Database: %DB_NAME%
echo    Port: %DB_PORT%
echo.

echo 🚀 Starting Backend Server...
cd backend
echo Testing database connection first...
node test-db-connection.js

if %errorlevel% neq 0 (
    echo ❌ Database connection failed! Cannot start server.
    echo 💡 Please run setup-mysql-remote-access.bat first
    pause
    exit /b
)

echo ✅ Database connection successful!
echo 🚀 Starting server...
node server.js

echo.
echo 🌐 Frontend will be available at: http://192.168.0.161:3011
echo 🔌 Backend API will be available at: http://192.168.0.161:3101
echo.
echo Press any key to exit...
pause > nul 