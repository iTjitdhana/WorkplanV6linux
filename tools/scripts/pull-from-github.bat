@echo off
echo ========================================
echo 🐳 Pull และ Run WorkplanV6 จาก GitHub Container Registry
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
echo.

echo 🔍 ตรวจสอบ Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker ไม่ได้ทำงาน กรุณาเริ่ม Docker ก่อน
    pause
    exit /b 1
)

echo 📥 Pull frontend image...
docker pull ghcr.io/%username%/workplanv6-frontend:%version%
if %errorlevel% neq 0 (
    echo ❌ Pull frontend ไม่สำเร็จ
    pause
    exit /b 1
)

echo 📥 Pull backend image...
docker pull ghcr.io/%username%/workplanv6-backend:%version%
if %errorlevel% neq 0 (
    echo ❌ Pull backend ไม่สำเร็จ
    pause
    exit /b 1
)

echo 🛑 หยุด containers ที่มีอยู่...
docker stop workplanv6-frontend workplanv6-backend 2>nul
docker rm workplanv6-frontend workplanv6-backend 2>nul

echo 🚀 เริ่มต้น run containers...

echo 📦 Running backend...
docker run -d ^
  --name workplanv6-backend ^
  -p 3102:3102 ^
  -e NODE_ENV=production ^
  -e DB_HOST=192.168.0.94 ^
  -e DB_USER=jitdhana ^
  -e DB_PASSWORD=iT12345$ ^
  -e DB_NAME=esp_tracker ^
  -e DB_PORT=3306 ^
  --restart unless-stopped ^
  ghcr.io/%username%/workplanv6-backend:%version%

if %errorlevel% neq 0 (
    echo ❌ Run backend ไม่สำเร็จ
    pause
    exit /b 1
)

echo 📦 Running frontend...
docker run -d ^
  --name workplanv6-frontend ^
  -p 3012:3012 ^
  -e NODE_ENV=production ^
  -e NEXT_PUBLIC_API_URL=http://192.168.0.94:3102 ^
  -e BACKEND_URL=http://backend:3102 ^
  --restart unless-stopped ^
  ghcr.io/%username%/workplanv6-frontend:%version%

if %errorlevel% neq 0 (
    echo ❌ Run frontend ไม่สำเร็จ
    pause
    exit /b 1
)

echo.
echo ✅ Pull และ run สำเร็จ!
echo.
echo 📋 Containers ที่รันอยู่:
docker ps --filter "name=workplanv6" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.
echo 🌐 URLs:
echo   - Frontend: http://localhost:3012
echo   - Backend API: http://localhost:3102
echo.
echo 📝 คำสั่งสำหรับจัดการ containers:
echo   - ดู logs: docker logs workplanv6-frontend
echo   - ดู logs: docker logs workplanv6-backend
echo   - หยุด: docker stop workplanv6-frontend workplanv6-backend
echo   - ลบ: docker rm workplanv6-frontend workplanv6-backend
echo.
pause
