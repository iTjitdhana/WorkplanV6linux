@echo off
echo ========================================
echo 🚀 รันระบบใน Development Mode (Windows)
echo ========================================

echo.
echo 📋 ขั้นตอน:
echo 1. แก้ไข Execution Policy
echo 2. ติดตั้ง dependencies (ถ้าจำเป็น)
echo 3. รัน Backend และ Frontend
echo.

REM แก้ไข Execution Policy
echo 🔧 แก้ไข PowerShell Execution Policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Execution Policy แก้ไขสำเร็จ
) else (
    echo ⚠️ ไม่สามารถแก้ไข Execution Policy ได้ (อาจต้องรันแบบ Administrator)
)

echo.
echo 🔧 ตรวจสอบและติดตั้ง Backend Dependencies...
cd backend
if not exist "node_modules" (
    echo 📦 ติดตั้ง Backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ การติดตั้ง Backend dependencies ล้มเหลว
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies ติดตั้งสำเร็จ
) else (
    echo ✅ Backend dependencies มีอยู่แล้ว
)

echo.
echo 🌐 ตรวจสอบและติดตั้ง Frontend Dependencies...
cd ..\frontend
if not exist "node_modules" (
    echo 📦 ติดตั้ง Frontend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ การติดตั้ง Frontend dependencies ล้มเหลว
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies ติดตั้งสำเร็จ
) else (
    echo ✅ Frontend dependencies มีอยู่แล้ว
)

cd ..

echo.
echo 🚀 เริ่มรันระบบ...
echo.

REM รัน Backend
echo 🔧 เริ่ม Backend Server...
start "Backend Server (Dev)" cmd /k "cd backend && set NODE_ENV=development && npm run dev"

REM รอสักครู่
timeout /t 5 /nobreak > nul

REM รัน Frontend
echo 🌐 เริ่ม Frontend Server...
start "Frontend Server (Dev)" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ ระบบกำลังเริ่มทำงาน...
echo.
echo 📊 URLs:
echo 🔧 Backend API: http://localhost:3101
echo 🌐 Frontend: http://localhost:3011
echo.
echo ⏳ กรุณารอสักครู่ให้ระบบเริ่มทำงาน...
echo.
pause 