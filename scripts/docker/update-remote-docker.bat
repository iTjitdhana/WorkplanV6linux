@echo off
echo ========================================
echo 🚀 อัปเดท Docker ในอีกเครื่อง
echo ========================================

echo.
echo 📋 ข้อมูล Image:
echo Registry: docker.io
echo Image: itjitdhana/workplnav6.2
echo.

echo 🔄 เริ่มต้นอัปเดท...
echo.

echo 1. Pull image ล่าสุดจาก Docker Hub...
docker pull itjitdhana/workplnav6.2:latest
if %errorlevel% neq 0 (
    echo ❌ Pull image ล้มเหลว
    echo 💡 ตรวจสอบ:
    echo - Network connection
    echo - Image มีอยู่ใน registry หรือไม่
    pause
    exit /b 1
)

echo.
echo 2. หยุด containers ปัจจุบัน...
docker-compose down
if %errorlevel% neq 0 (
    echo ⚠️ ไม่สามารถหยุด containers ได้ (อาจไม่มี containers ทำงานอยู่)
)

echo.
echo 3. เริ่มต้น containers ใหม่...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ เริ่มต้น containers ล้มเหลว
    pause
    exit /b 1
)

echo.
echo ✅ อัปเดทเสร็จสิ้น!
echo.

echo 📋 การตรวจสอบ:
echo 1. ตรวจสอบ containers: docker-compose ps
echo 2. ตรวจสอบ logs: docker-compose logs
echo 3. เปิดเว็บไซต์: http://localhost:3011
echo.

echo 🧪 ทดสอบการทำงาน...
timeout /t 5 /nobreak >nul

echo.
echo 📊 สถานะ Containers:
docker-compose ps

echo.
echo 📋 Logs ล่าสุด:
docker-compose logs --tail=10

echo.
pause
