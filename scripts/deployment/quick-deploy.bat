@echo off
echo ========================================
echo 🚀 Quick Production Deploy
echo ========================================

echo.
echo 📦 Building Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)
echo ✅ Frontend build successful

cd ..

echo.
echo 🔧 Restarting PM2...
pm2 restart all

if %errorlevel% neq 0 (
    echo ❌ PM2 restart failed
    pause
    exit /b 1
)

echo.
echo 📊 PM2 Status:
pm2 status

echo.
echo ✅ Quick Deploy Complete!
echo.
echo 🌐 URLs:
echo - Frontend: http://localhost:3011
echo - Backend: http://localhost:3101
echo.

pause 