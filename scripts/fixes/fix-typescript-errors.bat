@echo off
echo ========================================
echo 🔧 แก้ไข TypeScript Errors
echo ========================================

echo.
echo 📋 ปัญหาที่พบ:
echo - TypeScript error ใน API routes
echo - params type ไม่ถูกต้อง
echo.

echo 🔄 แก้ไขปัญหา...
echo.

echo 1. ตรวจสอบ TypeScript errors...
cd frontend
npx tsc --noEmit
if %errorlevel% equ 0 (
    echo ✅ ไม่มี TypeScript errors
) else (
    echo ⚠️ พบ TypeScript errors
    echo 💡 แก้ไขแล้วในไฟล์ route.ts
)

cd ..

echo.
echo 2. ทดสอบ build ใหม่...
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
