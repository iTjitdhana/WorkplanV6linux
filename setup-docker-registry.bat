@echo off
echo ========================================
echo 🐳 Setup Docker Registry
echo ========================================

echo.
echo 📋 เลือก Registry:
echo 1. Docker Hub (docker.io)
echo 2. GitHub Container Registry (ghcr.io)
echo 3. Custom Registry
echo.

set /p choice="เลือก Registry (1-3): "

if "%choice%"=="1" goto dockerhub
if "%choice%"=="2" goto github
if "%choice%"=="3" goto custom

echo ❌ ตัวเลือกไม่ถูกต้อง
pause
exit /b 1

:dockerhub
echo.
echo 🔄 Setup Docker Hub
echo.
set /p username="ใส่ Docker Hub Username: "
set /p image_name="ใส่ Image Name (เช่น workplan-app): "

echo.
echo 📋 ข้อมูล Registry:
echo Registry URL: docker.io
echo Image Name: %username%/%image_name%
echo.

echo 🔧 สร้างและ Push Image...
echo.

echo 1. Build Docker image...
docker build -t %image_name%:latest .
if %errorlevel% neq 0 (
    echo ❌ Docker build ล้มเหลว
    pause
    exit /b 1
)

echo 2. Tag image สำหรับ Docker Hub...
docker tag %image_name%:latest %username%/%image_name%:latest
if %errorlevel% neq 0 (
    echo ❌ Docker tag ล้มเหลว
    pause
    exit /b 1
)

echo 3. Login to Docker Hub...
docker login
if %errorlevel% neq 0 (
    echo ❌ Docker login ล้มเหลว
    pause
    exit /b 1
)

echo 4. Push image to Docker Hub...
docker push %username%/%image_name%:latest
if %errorlevel% neq 0 (
    echo ❌ Docker push ล้มเหลว
    pause
    exit /b 1
)

echo.
echo ✅ สร้าง Registry สำเร็จ!
echo.
echo 📋 ข้อมูลสำหรับใช้ในอีกเครื่อง:
echo Registry URL: docker.io
echo Image Name: %username%/%image_name%
echo.
echo 💡 ใช้คำสั่งนี้ในอีกเครื่อง:
echo docker pull %username%/%image_name%:latest
echo.
goto end

:github
echo.
echo 🔄 Setup GitHub Container Registry
echo.
set /p username="ใส่ GitHub Username: "
set /p image_name="ใส่ Image Name (เช่น workplan-app): "

echo.
echo 📋 ข้อมูล Registry:
echo Registry URL: ghcr.io
echo Image Name: %username%/%image_name%
echo.

echo 🔧 สร้างและ Push Image...
echo.

echo 1. Build Docker image...
docker build -t %image_name%:latest .
if %errorlevel% neq 0 (
    echo ❌ Docker build ล้มเหลว
    pause
    exit /b 1
)

echo 2. Tag image สำหรับ GitHub Container Registry...
docker tag %image_name%:latest ghcr.io/%username%/%image_name%:latest
if %errorlevel% neq 0 (
    echo ❌ Docker tag ล้มเหลว
    pause
    exit /b 1
)

echo 3. Login to GitHub Container Registry...
echo 💡 ต้องใช้ GitHub Personal Access Token
docker login ghcr.io
if %errorlevel% neq 0 (
    echo ❌ Docker login ล้มเหลว
    pause
    exit /b 1
)

echo 4. Push image to GitHub Container Registry...
docker push ghcr.io/%username%/%image_name%:latest
if %errorlevel% neq 0 (
    echo ❌ Docker push ล้มเหลว
    pause
    exit /b 1
)

echo.
echo ✅ สร้าง Registry สำเร็จ!
echo.
echo 📋 ข้อมูลสำหรับใช้ในอีกเครื่อง:
echo Registry URL: ghcr.io
echo Image Name: %username%/%image_name%
echo.
echo 💡 ใช้คำสั่งนี้ในอีกเครื่อง:
echo docker pull ghcr.io/%username%/%image_name%:latest
echo.
goto end

:custom
echo.
echo 🔄 Setup Custom Registry
echo.
set /p registry_url="ใส่ Registry URL: "
set /p image_name="ใส่ Image Name: "

echo.
echo 📋 ข้อมูล Registry:
echo Registry URL: %registry_url%
echo Image Name: %image_name%
echo.

echo 🔧 สร้างและ Push Image...
echo.

echo 1. Build Docker image...
docker build -t %image_name%:latest .
if %errorlevel% neq 0 (
    echo ❌ Docker build ล้มเหลว
    pause
    exit /b 1
)

echo 2. Tag image สำหรับ Custom Registry...
docker tag %image_name%:latest %registry_url%/%image_name%:latest
if %errorlevel% neq 0 (
    echo ❌ Docker tag ล้มเหลว
    pause
    exit /b 1
)

echo 3. Login to Custom Registry...
docker login %registry_url%
if %errorlevel% neq 0 (
    echo ❌ Docker login ล้มเหลว
    pause
    exit /b 1
)

echo 4. Push image to Custom Registry...
docker push %registry_url%/%image_name%:latest
if %errorlevel% neq 0 (
    echo ❌ Docker push ล้มเหลว
    pause
    exit /b 1
)

echo.
echo ✅ สร้าง Registry สำเร็จ!
echo.
echo 📋 ข้อมูลสำหรับใช้ในอีกเครื่อง:
echo Registry URL: %registry_url%
echo Image Name: %image_name%
echo.
echo 💡 ใช้คำสั่งนี้ในอีกเครื่อง:
echo docker pull %registry_url%/%image_name%:latest
echo.
goto end

:end
echo.
echo 📋 ไฟล์ที่สร้าง:
echo - setup-docker-registry.bat (ไฟล์นี้)
echo.
echo 💡 วิธีใช้งาน:
echo 1. รัน script นี้เพื่อสร้าง registry
echo 2. ใช้ข้อมูลที่ได้ใน update-docker-deployment.bat
echo 3. รัน update-docker-deployment.bat ในอีกเครื่อง
echo.
pause
