@echo off
REM 🔧 Create Backend Environment File
REM สำหรับสร้างไฟล์ .env ใน backend

echo.
echo ================================
echo Create Backend Environment
echo ================================
echo.

echo [INFO] Creating backend/.env file...
echo.

REM Create backend/.env
(
echo # Database Configuration
echo DB_HOST=192.168.0.94
echo DB_USER=jitdhana
echo DB_PASSWORD=iT12345$
echo DB_NAME=esp_tracker
echo DB_PORT=3306
echo.
echo # Server Configuration
echo PORT=3101
echo NODE_ENV=production
echo.
echo # Frontend Configuration
echo FRONTEND_URL=http://192.168.0.94:3011
echo.
echo # API Configuration
echo API_RATE_LIMIT=1000
echo.
echo # CORS Configuration
echo CORS_ORIGIN=http://192.168.0.94:3011
echo ALLOWED_ORIGINS=http://localhost:3011,http://127.0.0.1:3011,http://192.168.0.94:3011
echo.
echo # Security Configuration
echo JWT_SECRET=your_jwt_secret_key_here
echo SESSION_SECRET=your_session_secret_here
) > backend\.env

echo [SUCCESS] Backend environment file created: backend/.env
echo.
echo [INFO] Environment variables:
echo - DB_HOST=192.168.0.94
echo - DB_USER=jitdhana
echo - DB_PASSWORD=iT12345$
echo - DB_NAME=esp_tracker
echo - PORT=3101
echo - NODE_ENV=production
echo.
echo [INFO] Next steps:
echo 1. Restart backend server
echo 2. Test API endpoints
echo 3. Check frontend dropdowns
echo.
pause 