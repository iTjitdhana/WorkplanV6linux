@echo off
echo ========================================
echo 🚀 Production Deployment
echo ========================================

echo.
echo 📋 ขั้นตอนการ Deploy:
echo 1. Build Frontend
echo 2. Setup Production Environment
echo 3. Start PM2 Processes
echo 4. Health Check
echo.

REM ตรวจสอบ Node.js
echo 🔍 ตรวจสอบ Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ไม่พบ Node.js กรุณาติดตั้ง Node.js ก่อน
    pause
    exit /b 1
)
echo ✅ Node.js พร้อมใช้งาน

REM ตรวจสอบ PM2
echo 🔍 ตรวจสอบ PM2...
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ไม่พบ PM2 กรุณาติดตั้ง PM2 ก่อน
    echo 💡 รันคำสั่ง: npm install -g pm2
    pause
    exit /b 1
)
echo ✅ PM2 พร้อมใช้งาน

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
echo 🔧 Setting up Production Environment...
if not exist "logs" mkdir logs

REM ตรวจสอบไฟล์ .env ใน backend
if not exist "backend\.env" (
    echo ⚠️ ไม่พบไฟล์ backend\.env
    echo 💡 กรุณาสร้างไฟล์ backend\.env และตั้งค่า database
    pause
)

echo.
echo 🚀 Starting Production with PM2...
pm2 start ecosystem.config.js --env production

if %errorlevel% neq 0 (
    echo ❌ PM2 start failed
    pause
    exit /b 1
)

echo.
echo 📊 PM2 Status:
pm2 status

echo.
echo 🔍 Health Check...
timeout /t 3 /nobreak >nul

REM ทดสอบ backend health
echo 📡 ทดสอบ Backend API...
curl -s http://localhost:3101/api/work-plans >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API ทำงานปกติ
) else (
    echo ⚠️ Backend API อาจมีปัญหา
)

echo.
echo 🎯 Production Deployment Complete!
echo.
echo 🌐 URLs:
echo - Frontend: http://localhost:3011
echo - Backend: http://localhost:3101
echo - Tracker: http://localhost:3011/tracker
echo.
echo 📋 PM2 Commands:
echo - pm2 status (ดูสถานะ)
echo - pm2 logs (ดู logs)
echo - pm2 restart all (restart ทั้งหมด)
echo - pm2 stop all (หยุดทั้งหมด)
echo - pm2 delete all (ลบทั้งหมด)
echo.
echo 📊 Monitoring:
echo - pm2 monit (ดู performance)
echo - pm2 show workplan-backend (ดูรายละเอียด backend)
echo - pm2 show workplan-frontend (ดูรายละเอียด frontend)
echo.

pause 