@echo off
title WorkPlan V6 - First Time Setup
color 0B

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                 WorkPlan V6 Setup                        ║
echo  ║               First Time Installation                    ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

echo 🔧 กำลังติดตั้งระบบครั้งแรก...
echo.

:: ตรวจสอบ Node.js
echo [1/5] ตรวจสอบ Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js ไม่พบ
    echo 📥 กรุณาดาวน์โหลดและติดตั้ง Node.js จาก: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js พร้อมใช้งาน

:: ติดตั้ง Backend Dependencies
echo [2/5] ติดตั้ง Backend Dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ ติดตั้ง Backend Dependencies ล้มเหลว
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Backend Dependencies ติดตั้งเสร็จ

:: ติดตั้ง Frontend Dependencies
echo [3/5] ติดตั้ง Frontend Dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ ติดตั้ง Frontend Dependencies ล้มเหลว
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Frontend Dependencies ติดตั้งเสร็จ

:: สร้าง Environment Files
echo [4/5] สร้าง Environment Files...
if not exist "backend\.env" (
    copy "backend\env.example" "backend\.env" >nul
    echo ✅ สร้าง backend\.env
) else (
    echo ℹ️ backend\.env มีอยู่แล้ว
)

if not exist "frontend\.env.local" (
    copy "frontend\env.example" "frontend\.env.local" >nul
    echo ✅ สร้าง frontend\.env.local
) else (
    echo ℹ️ frontend\.env.local มีอยู่แล้ว
)

:: ทดสอบการเชื่อมต่อฐานข้อมูล
echo [5/5] ทดสอบการเชื่อมต่อฐานข้อมูล...
cd backend
node -e "const {testConnection} = require('./config/database'); testConnection();" 2>nul
if errorlevel 1 (
    echo ⚠️ ไม่สามารถเชื่อมต่อฐานข้อมูลได้
    echo 💡 กรุณาตรวจสอบการตั้งค่าใน backend\.env
) else (
    echo ✅ เชื่อมต่อฐานข้อมูลสำเร็จ
)
cd ..

echo.
echo 🎉 ติดตั้งระบบเสร็จสิ้น!
echo.
echo 📋 ขั้นตอนต่อไป:
echo    1. ตรวจสอบการตั้งค่าฐานข้อมูลใน backend\.env
echo    2. รันระบบด้วย start-workplan-system.bat
echo.
pause




