@echo off
echo ========================================
echo 🔍 ตรวจสอบข้อมูล Registry
echo ========================================

echo.
echo 📋 ข้อมูลที่คุณใส่:
echo Registry URL: itjitdhana/workplnav6.2
echo.
echo 💡 การวิเคราะห์ข้อมูล:
echo.

REM ตรวจสอบว่าเป็น Docker Hub หรือ GitHub
if "%1"=="docker" (
    echo ✅ Docker Hub:
    echo Registry URL: docker.io
    echo Image Name: itjitdhana/workplnav6.2
    echo Full Image: docker.io/itjitdhana/workplnav6.2:latest
    echo.
    echo 🔧 คำสั่งที่ใช้:
    echo docker pull docker.io/itjitdhana/workplnav6.2:latest
    echo.
    goto test_pull
) else if "%1"=="github" (
    echo ✅ GitHub Container Registry:
    echo Registry URL: ghcr.io
    echo Image Name: itjitdhana/workplnav6.2
    echo Full Image: ghcr.io/itjitdhana/workplnav6.2:latest
    echo.
    echo 🔧 คำสั่งที่ใช้:
    echo docker pull ghcr.io/itjitdhana/workplnav6.2:latest
    echo.
    goto test_pull
) else (
    echo ❓ เลือก Registry:
    echo 1. Docker Hub (docker.io)
    echo 2. GitHub Container Registry (ghcr.io)
    echo.
    set /p choice="เลือก (1-2): "
    
    if "%choice%"=="1" (
        call %0 docker
    ) else if "%choice%"=="2" (
        call %0 github
    ) else (
        echo ❌ ตัวเลือกไม่ถูกต้อง
        pause
        exit /b 1
    )
)

:test_pull
echo.
echo 🧪 ทดสอบ Pull Image...
echo.

if "%1"=="docker" (
    echo Testing: docker pull docker.io/itjitdhana/workplnav6.2:latest
    docker pull docker.io/itjitdhana/workplnav6.2:latest
) else if "%1"=="github" (
    echo Testing: docker pull ghcr.io/itjitdhana/workplnav6.2:latest
    docker pull ghcr.io/itjitdhana/workplnav6.2:latest
)

if %errorlevel% equ 0 (
    echo.
    echo ✅ Pull สำเร็จ!
    echo.
    echo 📋 ข้อมูลสำหรับ update-docker-deployment.bat:
    if "%1"=="docker" (
        echo Registry URL: docker.io
        echo Image Name: itjitdhana/workplnav6.2
    ) else (
        echo Registry URL: ghcr.io
        echo Image Name: itjitdhana/workplnav6.2
    )
) else (
    echo.
    echo ❌ Pull ล้มเหลว
    echo 💡 ตรวจสอบ:
    echo - Image มีอยู่ใน Registry หรือไม่
    echo - Network connection
    echo - Authentication (docker login)
)

echo.
pause
