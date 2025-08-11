@echo off
echo ========================================
echo 🐳 Push WorkplanV6 ไปยัง GitHub Container Registry
echo ========================================

echo.
echo 📋 กรุณาใส่ข้อมูล GitHub:
set /p username="GitHub Username: "
set /p version="Version (เช่น latest): "

if "%version%"=="" set version=latest

echo.
echo 📋 ข้อมูลที่จะใช้:
echo Username: %username%
echo Version: %version%
echo Repository: https://github.com/%username%/WorkplanV6.git
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

echo 🔐 Login to GitHub Container Registry...
echo 💡 ต้องใช้ GitHub Personal Access Token (ไม่ใช่ password)
docker login ghcr.io -u %username%
if %errorlevel% neq 0 (
    echo ❌ Login ไม่สำเร็จ
    echo 💡 ตรวจสอบ GitHub Personal Access Token
    echo 💡 ไปที่: https://github.com/settings/tokens
    pause
    exit /b 1
)

echo 🏷️ Tag images สำหรับ GHCR...
docker tag workplanv6-frontend:%version% ghcr.io/%username%/workplanv6-frontend:%version%
docker tag workplanv6-backend:%version% ghcr.io/%username%/workplanv6-backend:%version%

echo 📤 Push frontend image...
docker push ghcr.io/%username%/workplanv6-frontend:%version%
if %errorlevel% neq 0 (
    echo ❌ Push frontend ไม่สำเร็จ
    pause
    exit /b 1
)

echo 📤 Push backend image...
docker push ghcr.io/%username%/workplanv6-backend:%version%
if %errorlevel% neq 0 (
    echo ❌ Push backend ไม่สำเร็จ
    pause
    exit /b 1
)

echo.
echo ✅ Push สำเร็จ!
echo.
echo 📋 Images ที่ push แล้ว:
echo   - ghcr.io/%username%/workplanv6-frontend:%version%
echo   - ghcr.io/%username%/workplanv6-backend:%version%
echo.
echo 🌐 GitHub Container Registry URLs:
echo   - https://github.com/%username%/workplanv6-frontend/packages
echo   - https://github.com/%username%/workplanv6-backend/packages
echo.
echo 📝 คำสั่งสำหรับ pull ในเครื่องอื่น:
echo   - docker pull ghcr.io/%username%/workplanv6-frontend:%version%
echo   - docker pull ghcr.io/%username%/workplanv6-backend:%version%
echo.
echo 📝 คำสั่งสำหรับ run:
echo   - docker run -p 3011:3011 ghcr.io/%username%/workplanv6-frontend:%version%
echo   - docker run -p 3101:3101 ghcr.io/%username%/workplanv6-backend:%version%
echo.
pause
