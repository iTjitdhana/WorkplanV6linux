@echo off
echo ========================================
echo 🔧 แก้ไขปัญหา Docker Build
echo ========================================

echo.
echo 📋 ปัญหาที่พบ:
echo - Missing script: "build"
echo - ENV format ไม่ถูกต้อง
echo - Dockerfile ไม่ชี้ไปที่ frontend directory
echo.

echo 🔄 แก้ไขปัญหา...
echo.

echo 1. ตรวจสอบ frontend/package.json...
if exist "frontend\package.json" (
    echo ✅ พบ frontend/package.json
    echo 📋 Scripts ที่มี:
    findstr "build" frontend\package.json
) else (
    echo ❌ ไม่พบ frontend/package.json
    pause
    exit /b 1
)

echo.
echo 2. ตรวจสอบ Dockerfile...
echo 📋 การแก้ไขที่ทำ:
echo - เปลี่ยนจาก COPY . . เป็น COPY frontend/ .
echo - เปลี่ยนจาก COPY package.json เป็น COPY frontend/package.json
echo - แก้ไข ENV format เป็น key=value
echo - เปลี่ยน port จาก 3000 เป็น 3011

echo.
echo 3. ทดสอบ build ใหม่...
echo.

echo 🔧 Build Docker image...
docker build -t workplan-app:latest .
if %errorlevel% equ 0 (
    echo.
    echo ✅ Build สำเร็จ!
    echo.
    echo 📋 ขั้นตอนต่อไป:
    echo 1. ทดสอบ image: docker run -p 3011:3011 workplan-app:latest
    echo 2. Build และ push: .\build-and-push.bat
    echo.
) else (
    echo.
    echo ❌ Build ล้มเหลว
    echo 💡 ตรวจสอบ error message ด้านบน
    echo.
)

echo.
pause
