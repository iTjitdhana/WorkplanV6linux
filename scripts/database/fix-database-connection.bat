@echo off
echo ========================================
echo 🔧 แก้ไขปัญหา Database Connection
echo ========================================

echo.
echo 📋 ปัญหาที่พบ:
echo - Database configuration ไม่ถูกต้อง
echo - ใช้ MySQL ใน Docker แทนที่จะเชื่อมต่อ 192.168.0.94
echo.

echo 🔄 แก้ไขปัญหา...
echo.

echo 1. หยุด containers ปัจจุบัน...
docker-compose down
if %errorlevel% neq 0 (
    echo ⚠️ ไม่สามารถหยุด containers ได้ (อาจไม่มี containers ทำงานอยู่)
)

echo.
echo 2. ตรวจสอบการเชื่อมต่อ Database...
echo 📋 ข้อมูล Database:
echo Host: 192.168.0.94
echo User: jitdhana
echo Password: iT12345$
echo Database: esp_tracker
echo Port: 3306
echo.

echo 3. ทดสอบการเชื่อมต่อ...
ping -n 1 192.168.0.94
if %errorlevel% equ 0 (
    echo ✅ สามารถ ping 192.168.0.94 ได้
) else (
    echo ❌ ไม่สามารถ ping 192.168.0.94 ได้
    echo 💡 ตรวจสอบ network connection
)

echo.
echo 4. เริ่มต้น containers ใหม่...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ เริ่มต้น containers ล้มเหลว
    pause
    exit /b 1
)

echo.
echo ✅ แก้ไขปัญหาเสร็จสิ้น!
echo.

echo 📋 การตรวจสอบ:
echo 1. ตรวจสอบ containers: docker-compose ps
echo 2. ตรวจสอบ logs: docker-compose logs backend
echo 3. เปิดเว็บไซต์: http://localhost:3011
echo.

echo 🧪 ทดสอบการทำงาน...
timeout /t 5 /nobreak >nul

echo.
echo 📊 สถานะ Containers:
docker-compose ps

echo.
echo 📋 Logs Backend:
docker-compose logs backend --tail=10

echo.
echo 🌐 เปิดเว็บไซต์:
echo http://localhost:3011
echo.

echo 💡 ตรวจสอบ:
echo - Backend สามารถเชื่อมต่อ Database ได้
echo - ไม่มี error เกี่ยวกับ MySQL connection
echo.

pause
