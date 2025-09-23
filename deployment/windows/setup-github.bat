@echo off
echo 🐙 ตั้งค่า GitHub Repository สำหรับ WorkplanV6
echo ================================================

REM ตรวจสอบ Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git ไม่ได้ติดตั้ง
    echo กรุณาติดตั้ง Git for Windows
    echo Download: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ พบ Git command

REM ตรวจสอบว่าเป็น Git repository หรือไม่
if not exist ".git" (
    echo 📁 เริ่มต้น Git repository...
    git init
    echo ✅ สร้าง Git repository เสร็จสิ้น
) else (
    echo ✅ พบ Git repository อยู่แล้ว
)

REM เพิ่มไฟล์ทั้งหมด
echo 📦 เพิ่มไฟล์ทั้งหมด...
git add .

REM Commit
echo 💾 Commit ไฟล์...
git commit -m "Initial commit - WorkplanV6 Linux Deployment Ready"

echo ""
echo 🎯 ขั้นตอนถัดไป:
echo ================
echo 1. ไปที่ https://github.com
echo 2. สร้าง New Repository ชื่อ 'workplanv6'
echo 3. เลือก Private repository
echo 4. คลิก Create repository
echo 5. Copy URL ของ repository
echo 6. รันคำสั่งต่อไปนี้:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/workplanv6.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 7. SSH เข้า Linux server และรัน:
echo    ./deploy-from-github.sh
echo.

REM ถามว่าต้องการเพิ่ม remote หรือไม่
set /p add_remote="ต้องการเพิ่ม GitHub remote URL ตอนนี้? (y/N): "
if /i "%add_remote%"=="y" (
    set /p github_url="กรอก GitHub Repository URL: "
    git remote add origin %github_url%
    git branch -M main
    echo 📤 Push ไป GitHub...
    git push -u origin main
    if %errorlevel% equ 0 (
        echo ✅ Push ไป GitHub สำเร็จ!
    ) else (
        echo ❌ Push ล้มเหลว ตรวจสอบ URL และ credentials
    )
)

echo ""
echo 🎉 ตั้งค่าเสร็จสิ้น!
echo ===================
echo 📋 ไฟล์ที่สร้างใหม่:
echo - deploy-from-github.sh (สำหรับ Linux server)
echo - GitHub-Deployment-Guide.md (คู่มือละเอียด)
echo - setup-github.bat (ไฟล์นี้)
echo.
echo 📖 อ่านคู่มือเพิ่มเติม: GitHub-Deployment-Guide.md

pause
