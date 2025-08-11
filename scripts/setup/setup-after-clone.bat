@echo off
echo ========================================
echo 🚀 Setup โปรเจคหลัง Git Clone
echo ========================================

echo.
echo 📋 ขั้นตอนการ Setup:
echo 1. ตรวจสอบ Node.js และ npm
echo 2. ติดตั้ง Backend Dependencies
echo 3. ติดตั้ง Frontend Dependencies
echo 4. สร้างไฟล์ Environment
echo 5. ตรวจสอบ Database
echo.

REM ตรวจสอบ Node.js
echo 🔍 ตรวจสอบ Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ไม่พบ Node.js กรุณาติดตั้ง Node.js ก่อน
    echo 💡 ดาวน์โหลดจาก: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js พร้อมใช้งาน

REM ตรวจสอบ npm
echo 🔍 ตรวจสอบ npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ไม่พบ npm
    pause
    exit /b 1
)
echo ✅ npm พร้อมใช้งาน

echo.
echo 🔧 ติดตั้ง Backend Dependencies...
cd backend
if not exist "node_modules" (
    echo 📦 ติดตั้ง npm packages...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ การติดตั้ง Backend Dependencies ล้มเหลว
        pause
        exit /b 1
    )
    echo ✅ Backend Dependencies ติดตั้งสำเร็จ
) else (
    echo ✅ Backend Dependencies มีอยู่แล้ว
)

REM ตรวจสอบไฟล์ .env
if not exist ".env" (
    echo 📝 สร้างไฟล์ .env...
    echo # Database Configuration > .env
    echo DB_HOST=localhost >> .env
    echo DB_USER=root >> .env
    echo DB_PASSWORD=your_password >> .env
    echo DB_NAME=workplan >> .env
    echo DB_PORT=3306 >> .env
    echo. >> .env
    echo # Server Configuration >> .env
    echo PORT=3101 >> .env
    echo NODE_ENV=development >> .env
    echo. >> .env
    echo # Google Apps Script URL >> .env
    echo GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec >> .env
    echo ✅ สร้างไฟล์ .env สำเร็จ
    echo ⚠️ กรุณาแก้ไข DB_PASSWORD ในไฟล์ backend/.env
) else (
    echo ✅ ไฟล์ .env มีอยู่แล้ว
)

cd ..

echo.
echo 🌐 ติดตั้ง Frontend Dependencies...
cd frontend
if not exist "node_modules" (
    echo 📦 ติดตั้ง npm packages...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ การติดตั้ง Frontend Dependencies ล้มเหลว
        pause
        exit /b 1
    )
    echo ✅ Frontend Dependencies ติดตั้งสำเร็จ
) else (
    echo ✅ Frontend Dependencies มีอยู่แล้ว
)

REM ตรวจสอบไฟล์ .env.local
if not exist ".env.local" (
    echo 📝 สร้างไฟล์ .env.local...
    echo NEXT_PUBLIC_API_URL=http://localhost:3101 > .env.local
    echo ✅ สร้างไฟล์ .env.local สำเร็จ
) else (
    echo ✅ ไฟล์ .env.local มีอยู่แล้ว
)

cd ..

echo.
echo 🗄️ ตรวจสอบ Database...
echo ⚠️ กรุณาตรวจสอบว่า MySQL รันอยู่และมี database 'workplan'
echo 💡 รันคำสั่งต่อไปนี้ใน MySQL:
echo    CREATE DATABASE workplan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo    USE workplan;
echo    SOURCE backend/fix_database.sql;

echo.
echo 🎯 การ Setup เสร็จสิ้น!
echo.
echo 📋 ขั้นตอนต่อไป:
echo 1. แก้ไข DB_PASSWORD ในไฟล์ backend/.env
echo 2. รัน SQL scripts ใน MySQL
echo 3. รันคำสั่ง: restart-system.bat
echo.
echo 🌐 URLs:
echo - Frontend: http://localhost:3011
echo - Backend: http://localhost:3101
echo - Tracker: http://localhost:3011/tracker
echo.

pause 