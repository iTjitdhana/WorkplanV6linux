@echo off
echo ========================================
echo 🐳 Build และ Push Docker Image
echo ========================================

echo.
echo 📋 ข้อมูล Repository:
set /p username="ใส่ Username: "
set /p image_name="ใส่ Image Name (เช่น workplan-app): "
set /p registry_type="เลือก Registry (1=Docker Hub, 2=GitHub): "

if "%registry_type%"=="1" (
    set registry_url=docker.io
    set full_image_name=%username%/%image_name%
) else if "%registry_type%"=="2" (
    set registry_url=ghcr.io
    set full_image_name=ghcr.io/%username%/%image_name%
) else (
    echo ❌ ตัวเลือกไม่ถูกต้อง
    pause
    exit /b 1
)

echo.
echo 📋 ข้อมูล Image:
echo Registry URL: %registry_url%
echo Image Name: %full_image_name%
echo.

echo 🔧 เริ่มต้น Build และ Push...
echo.

echo 1. Build Docker image...
docker build -t %image_name%:latest .
if %errorlevel% neq 0 (
    echo ❌ Docker build ล้มเหลว
    pause
    exit /b 1
)

echo 2. Tag image สำหรับ Registry...
docker tag %image_name%:latest %full_image_name%:latest
if %errorlevel% neq 0 (
    echo ❌ Docker tag ล้มเหลว
    pause
    exit /b 1
)

echo 3. Login to Registry...
if "%registry_type%"=="1" (
    docker login
) else (
    echo 💡 ต้องใช้ GitHub Personal Access Token
    docker login %registry_url%
)
if %errorlevel% neq 0 (
    echo ❌ Docker login ล้มเหลว
    pause
    exit /b 1
)

echo 4. Push image to Registry...
docker push %full_image_name%:latest
if %errorlevel% neq 0 (
    echo ❌ Docker push ล้มเหลว
    pause
    exit /b 1
)

echo.
echo ✅ Build และ Push สำเร็จ!
echo.
echo 📋 ข้อมูลสำหรับใช้ในอีกเครื่อง:
echo Registry URL: %registry_url%
echo Image Name: %full_image_name%
echo.
echo 💡 ใช้คำสั่งนี้ในอีกเครื่อง:
echo docker pull %full_image_name%:latest
echo.
echo 💡 หรือใช้ update-docker-deployment.bat:
echo 1. เลือกวิธีที่ 2: Docker Registry Pull
echo 2. ใส่ Registry URL: %registry_url%
echo 3. ใส่ Image Name: %full_image_name%
echo.
pause
