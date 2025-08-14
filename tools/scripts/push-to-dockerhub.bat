@echo off
echo ========================================
echo 🐳 Push WorkplanV6 ไปยัง Docker Hub
echo ========================================

echo.
echo 📋 กรุณาใส่ข้อมูล Docker Hub:
set /p username="Docker Hub Username: "
set /p image_name="Image Name (เช่น workplanv6): "
set /p version="Version (เช่น latest): "

if "%version%"=="" set version=latest
if "%image_name%"=="" set image_name=workplanv6

echo.
echo 📋 ข้อมูลที่จะใช้:
echo Username: %username%
echo Image Name: %image_name%
echo Version: %version%
echo.

echo 🔍 ตรวจสอบ Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker ไม่ได้ทำงาน กรุณาเริ่ม Docker ก่อน
    pause
    exit /b 1
)

echo 🔨 เริ่มต้น build Docker images...
echo.

echo 📦 Building frontend image...
docker build -t workplanv6-frontend:%version% .
if %errorlevel% neq 0 (
    echo ❌ Build frontend ไม่สำเร็จ
    pause
    exit /b 1
)

echo 📦 Building backend image...
docker build -t workplanv6-backend:%version% ./backend
if %errorlevel% neq 0 (
    echo ❌ Build backend ไม่สำเร็จ
    pause
    exit /b 1
)

echo 🔐 Login to Docker Hub...
docker login -u %username%
if %errorlevel% neq 0 (
    echo ❌ Login ไม่สำเร็จ กรุณาตรวจสอบ credentials
    pause
    exit /b 1
)

echo 🏷️ Tag images...
docker tag workplanv6-frontend:%version% %username%/%image_name%-frontend:%version%
docker tag workplanv6-backend:%version% %username%/%image_name%-backend:%version%

echo 📤 Push frontend image...
docker push %username%/%image_name%-frontend:%version%
if %errorlevel% neq 0 (
    echo ❌ Push frontend ไม่สำเร็จ
    pause
    exit /b 1
)

echo 📤 Push backend image...
docker push %username%/%image_name%-backend:%version%
if %errorlevel% neq 0 (
    echo ❌ Push backend ไม่สำเร็จ
    pause
    exit /b 1
)

echo.
echo ✅ Push สำเร็จ!
echo.
echo 📋 Images ที่ push แล้ว:
echo   - %username%/%image_name%-frontend:%version%
echo   - %username%/%image_name%-backend:%version%
echo.
echo 🌐 Docker Hub URLs:
echo   - https://hub.docker.com/r/%username%/%image_name%-frontend
echo   - https://hub.docker.com/r/%username%/%image_name%-backend
echo.
echo 📝 คำสั่งสำหรับ pull:
echo   - docker pull %username%/%image_name%-frontend:%version%
echo   - docker pull %username%/%image_name%-backend:%version%
echo.
echo 📝 คำสั่งสำหรับ run:
echo   - docker run -p 3012:3012 %username%/%image_name%-frontend:%version%
echo   - docker run -p 3102:3102 %username%/%image_name%-backend:%version%
echo.
pause
