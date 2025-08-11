@echo off
echo ========================================
echo 🚀 ติดตั้ง Dependencies ที่จำเป็น
echo ========================================

echo.
echo 📋 ขั้นตอนการติดตั้ง:
echo 1. ติดตั้ง nodemon (สำหรับ backend)
echo 2. ติดตั้ง dependencies ของ backend
echo 3. ติดตั้ง dependencies ของ frontend
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
echo 📦 ติดตั้ง nodemon...
npm install -g nodemon
if %errorlevel% neq 0 (
    echo ❌ การติดตั้ง nodemon ล้มเหลว
    pause
    exit /b 1
)
echo ✅ nodemon ติดตั้งสำเร็จ

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

cd ..

echo.
echo 🎉 การติดตั้งเสร็จสิ้น!
echo.
echo 📋 สิ่งที่ติดตั้งแล้ว:
echo ✅ Node.js และ npm
echo ✅ nodemon (สำหรับ backend)
echo ✅ Backend dependencies
echo ✅ Frontend dependencies
echo.
echo 🚀 พร้อมรันระบบแล้ว!
echo.
echo 💡 คำสั่งสำหรับรันระบบ:
echo - Development: .\start-dev-fixed.bat
echo - Production: .\start-production.bat
echo.
pause 