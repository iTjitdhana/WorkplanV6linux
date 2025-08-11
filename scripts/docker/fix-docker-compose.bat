@echo off
echo ========================================
echo 🔧 แก้ไขปัญหา Docker Compose
echo ========================================

echo.
echo 📋 ปัญหาที่พบ:
echo - docker-compose.yml ใช้ build แทน image
echo - ไม่ได้ใช้ image ที่ pull มาจาก registry
echo.

echo 🔄 แก้ไขปัญหา...
echo.

echo 1. หยุด containers ปัจจุบัน...
docker-compose down
if %errorlevel% neq 0 (
    echo ⚠️ ไม่สามารถหยุด containers ได้ (อาจไม่มี containers ทำงานอยู่)
)

echo.
echo 2. ลบ images เก่า...
docker rmi workplan-app:latest 2>nul
docker rmi workplanv6-frontend:latest 2>nul
docker rmi workplanv6-backend:latest 2>nul

echo.
echo 3. Pull image ล่าสุด...
docker pull itjitdhana/workplnav6.2:latest
if %errorlevel% neq 0 (
    echo ❌ Pull image ล้มเหลว
    pause
    exit /b 1
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
echo 🌐 เปิดเว็บไซต์:
echo http://localhost:3011
echo.

echo 💡 ตรวจสอบการแก้ไข:
echo - Dropdown ในช่องค้นหา
echo - ปุ่ม "เพิ่มรายการใหม่"
echo.

pause
