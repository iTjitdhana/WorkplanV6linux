@echo off
echo ========================================
echo Starting Frontend Server (Simple)
echo ========================================
echo.

echo 🔧 Setting environment variables...
set NODE_ENV=production
set NEXT_PUBLIC_API_URL=http://192.168.0.161:3101
set NEXT_PUBLIC_APP_ENV=production
set PORT=3011

echo.
echo 📊 Configuration:
echo    API URL: %NEXT_PUBLIC_API_URL%
echo    Environment: %NODE_ENV%
echo    Port: %PORT%
echo.

echo 🚀 Starting frontend server...
cd frontend

echo Building frontend...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check for errors above.
    pause
    exit /b
)

echo ✅ Build completed!
echo 🚀 Starting production server...
call npm start

echo.
echo 🌐 Frontend: http://192.168.0.161:3011
echo 🔌 Backend API: http://192.168.0.161:3101
echo.
pause 