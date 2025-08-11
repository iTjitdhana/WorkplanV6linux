@echo off
echo ========================================
echo 🔄 Rolling back to previous version
echo ========================================

echo.
echo ⚠️ กำลัง rollback ไปยังเวอร์ชันก่อนหน้า...
echo.

REM ตรวจสอบ git status
echo 🔍 ตรวจสอบ Git status...
git status --porcelain
if %errorlevel% neq 0 (
    echo ❌ Git ไม่พร้อมใช้งาน
    pause
    exit /b 1
)

echo.
echo 📦 Reverting to previous commit...
git reset --hard HEAD~1

if %errorlevel% neq 0 (
    echo ❌ Git reset failed
    pause
    exit /b 1
)

echo.
echo 📦 Rebuilding Frontend...
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
echo ✅ Rollback Complete!
echo.
echo 🌐 URLs:
echo - Frontend: http://localhost:3011
echo - Backend: http://localhost:3101
echo.

pause 