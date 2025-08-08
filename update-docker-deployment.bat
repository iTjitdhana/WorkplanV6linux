@echo off
echo ========================================
echo 🐳 อัปเดท Docker Deployment
echo ========================================

echo.
echo 📋 เลือกวิธีอัปเดท:
echo 1. Git Pull + Rebuild
echo 2. Docker Registry Pull
echo 3. Volume Mounting (Development)
echo 4. Manual File Copy
echo.

set /p choice="เลือกวิธี (1-4): "

if "%choice%"=="1" goto git_method
if "%choice%"=="2" goto registry_method
if "%choice%"=="3" goto volume_method
if "%choice%"=="4" goto manual_method

echo ❌ ตัวเลือกไม่ถูกต้อง
pause
exit /b 1

:git_method
echo.
echo 🔄 วิธีที่ 1: Git Pull + Rebuild
echo.
echo 1. Pull โค้ดใหม่จาก Git...
git pull origin main
if %errorlevel% neq 0 (
    echo ❌ Git pull ล้มเหลว
    pause
    exit /b 1
)

echo 2. Build Docker images ใหม่...
docker-compose build
if %errorlevel% neq 0 (
    echo ❌ Docker build ล้มเหลว
    pause
    exit /b 1
)

echo 3. Restart containers...
docker-compose down
docker-compose up -d

echo ✅ อัปเดทเสร็จสิ้น!
goto end

:registry_method
echo.
echo 🔄 วิธีที่ 2: Docker Registry Pull
echo.
echo 💡 ตัวอย่างข้อมูล:
echo - Registry URL: docker.io หรือ ghcr.io
echo - Image Name: username/repository-name
echo.
set /p registry="ใส่ Registry URL: "
set /p image_name="ใส่ Image Name: "

echo.
echo 📋 ข้อมูลที่ใส่:
echo Registry URL: %registry%
echo Image Name: %image_name%
echo Full Image: %registry%/%image_name%:latest
echo.

echo 1. Pull image ใหม่จาก registry...
docker pull %registry%/%image_name%:latest
if %errorlevel% neq 0 (
    echo ❌ Docker pull ล้มเหลว
    pause
    exit /b 1
)

echo 2. Restart containers...
docker-compose down
docker-compose up -d

echo ✅ อัปเดทเสร็จสิ้น!
goto end

:volume_method
echo.
echo 🔄 วิธีที่ 3: Volume Mounting (Development)
echo.
echo ตรวจสอบว่า docker-compose.yml มี volume mounting...
echo.
echo 1. Restart containers...
docker-compose down
docker-compose up -d

echo ✅ อัปเดทเสร็จสิ้น!
echo 💡 โค้ดจะอัปเดทอัตโนมัติเมื่อแก้ไขไฟล์
goto end

:manual_method
echo.
echo 🔄 วิธีที่ 4: Manual File Copy
echo.
set /p source_path="ใส่ path ของไฟล์ที่แก้ไข: "
set /p target_path="ใส่ path ปลายทาง: "

echo 1. Copy ไฟล์...
copy "%source_path%" "%target_path%"
if %errorlevel% neq 0 (
    echo ❌ Copy ไฟล์ล้มเหลว
    pause
    exit /b 1
)

echo 2. Restart containers...
docker-compose restart

echo ✅ อัปเดทเสร็จสิ้น!
goto end

:end
echo.
echo 📋 การตรวจสอบ:
echo 1. ตรวจสอบ containers: docker-compose ps
echo 2. ตรวจสอบ logs: docker-compose logs
echo 3. เปิดเว็บไซต์: http://localhost:3011
echo.
pause
