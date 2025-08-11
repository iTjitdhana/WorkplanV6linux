@echo off
echo ========================================
echo 🔍 แก้ไขปัญหา Search Failed
echo ========================================

echo.
echo 📋 ปัญหาที่พบ:
echo - Search failed ใน SearchBox.tsx
echo - API endpoint /api/process-steps/search ไม่ทำงาน
echo.

echo 🔧 ตรวจสอบ Backend Server...
netstat -an | findstr :3101
if %errorlevel% equ 0 (
    echo ✅ Backend server ทำงานอยู่ที่ port 3101
) else (
    echo ❌ Backend server ไม่ทำงาน
    echo.
    echo 💡 วิธีแก้ไข:
    echo 1. รัน backend server: cd backend && npm run dev
    echo 2. หรือใช้: .\start-dev-windows.bat
    pause
    exit /b 1
)

echo.
echo 🔧 ทดสอบ API endpoint...
curl -s "http://localhost:3101/api/process-steps/search?query=test" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API endpoint ทำงานได้
) else (
    echo ❌ API endpoint ไม่ทำงาน
    echo.
    echo 💡 ตรวจสอบ:
    echo 1. Backend server ทำงานอยู่
    echo 2. Database มีข้อมูล
    echo 3. Network connection
)

echo.
echo 🔧 ตรวจสอบ Database...
echo 💡 ตรวจสอบว่า MySQL ทำงานอยู่และมีข้อมูลในตาราง process_steps

echo.
echo 📋 สิ่งที่แก้ไขแล้ว:
echo ✅ สร้าง search endpoint ใน frontend
echo ✅ Backend มี search endpoint แล้ว
echo ✅ Mock data สำหรับทดสอบ

echo.
echo 💡 วิธีทดสอบ:
echo 1. รันระบบ: .\start-dev-windows.bat
echo 2. เปิด http://localhost:3011
echo 3. ทดสอบค้นหาในช่อง Search
echo.
pause 