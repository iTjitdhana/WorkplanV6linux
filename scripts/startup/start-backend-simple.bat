@echo off
echo ========================================
echo Starting Backend Server (Simple)
echo ========================================
echo.

echo 🔧 Setting environment variables...
set NODE_ENV=production
set DB_HOST=192.168.0.94
set DB_USER=jitdhana
set DB_PASSWORD=iT12345$
set DB_NAME=esp_tracker
set DB_PORT=3306
set PRODUCTION_HOST=192.168.0.161
set PORT=3101

echo.
echo 📊 Configuration:
echo    Database: %DB_HOST%:%DB_PORT%
echo    User: %DB_USER%
echo    Database: %DB_NAME%
echo    Server: %PRODUCTION_HOST%:%PORT%
echo.

echo 🚀 Starting backend server...
cd backend
node server.js

echo.
echo 🌐 Backend API: http://192.168.0.161:3101
echo.
pause 