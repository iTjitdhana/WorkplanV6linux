@echo off
echo ========================================
echo    รายการไฟล์ .bat ที่มีอยู่จริง
echo ========================================
echo.

echo 📁 โฟลเดอร์ startup:
echo ----------------------------------------
if exist "scripts\startup\*.bat" (
    dir /b scripts\startup\*.bat
) else (
    echo ไม่มีไฟล์ .bat ในโฟลเดอร์ startup
)
echo.

echo 📁 โฟลเดอร์ testing:
echo ----------------------------------------
if exist "scripts\testing\*.bat" (
    dir /b scripts\testing\*.bat
) else (
    echo ไม่มีไฟล์ .bat ในโฟลเดอร์ testing
)
echo.

echo 📁 โฟลเดอร์ fixes:
echo ----------------------------------------
if exist "scripts\fixes\*.bat" (
    dir /b scripts\fixes\*.bat
) else (
    echo ไม่มีไฟล์ .bat ในโฟลเดอร์ fixes
)
echo.

echo 📁 โฟลเดอร์ deployment:
echo ----------------------------------------
if exist "scripts\deployment\*.bat" (
    dir /b scripts\deployment\*.bat
) else (
    echo ไม่มีไฟล์ .bat ในโฟลเดอร์ deployment
)
echo.

echo 📁 โฟลเดอร์ database:
echo ----------------------------------------
if exist "scripts\database\*.bat" (
    dir /b scripts\database\*.bat
) else (
    echo ไม่มีไฟล์ .bat ในโฟลเดอร์ database
)
echo.

echo 📁 โฟลเดอร์ setup:
echo ----------------------------------------
if exist "scripts\setup\*.bat" (
    dir /b scripts\setup\*.bat
) else (
    echo ไม่มีไฟล์ .bat ในโฟลเดอร์ setup
)
echo.

echo 📁 โฟลเดอร์ docker:
echo ----------------------------------------
if exist "scripts\docker\*.bat" (
    dir /b scripts\docker\*.bat
) else (
    echo ไม่มีไฟล์ .bat ในโฟลเดอร์ docker
)
echo.

echo ========================================
echo    สคริปต์หลัก
echo ========================================
echo.
echo 🚀 quick-commands.bat - เมนูหลักสำหรับการใช้งานทั่วไป
echo 🛠️ system-manager.bat - จัดการระบบแบบครบวงจร
echo 📦 install-system.bat - ติดตั้งระบบใหม่
echo 📋 list-available-scripts.bat - แสดงรายการไฟล์ (ไฟล์นี้)
echo.

pause
