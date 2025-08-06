@echo off
echo ========================================
echo Starting Frontend Production
echo ========================================
echo.

echo 🔧 Setting up environment variables...
set NODE_ENV=production
set NEXT_PUBLIC_API_URL=http://192.168.0.161:3101
set NEXT_PUBLIC_APP_ENV=production
set PORT=3011

echo.
echo 📊 Frontend Configuration:
echo    API URL: %NEXT_PUBLIC_API_URL%
echo    Environment: %NODE_ENV%
echo    Port: %PORT%
echo.

echo 🚀 Starting Frontend Server...
cd frontend

echo Building frontend for production...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check for errors above.
    pause
    exit /b
)

echo.
echo ✅ Build completed successfully!
echo.

echo 🚀 Starting production server...
call npm start

echo.
echo 🌐 Frontend will be available at: http://192.168.0.161:3011
echo 🔌 Backend API: http://192.168.0.161:3101
echo.
echo Press Ctrl+C to stop the server...
pause 