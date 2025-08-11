@echo off
echo ========================================
echo 🔧 แก้ไข PowerShell Execution Policy
echo ========================================

echo.
echo 📋 ปัญหาที่พบ:
echo - npm ไม่สามารถรันได้ใน PowerShell
echo - เกิดจาก Execution Policy ป้องกันการรัน scripts
echo.

echo 🔧 แก้ไข Execution Policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"

if %errorlevel% equ 0 (
    echo ✅ แก้ไข Execution Policy สำเร็จ!
    echo.
    echo 🔄 กรุณาเปิด PowerShell ใหม่
    echo.
    echo 💡 ทดสอบการทำงาน:
    echo - cd frontend
    echo - npm --version
    echo - npm run dev
) else (
    echo ❌ การแก้ไขล้มเหลว
    echo.
    echo 💡 วิธีแก้ไขแบบอื่น:
    echo 1. เปิด PowerShell แบบ Administrator
    echo 2. รัน: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    echo 3. เลือก "Y" เมื่อถาม
)

echo.
pause 