@echo off
echo ========================================
echo    WorkplanV6 - System Installation
echo ========================================
echo.
echo สคริปต์นี้จะติดตั้งระบบ WorkplanV6 ใหม่
echo.
set /p confirm="คุณต้องการดำเนินการต่อหรือไม่? (y/n): "
if /i not "%confirm%"=="y" goto exit

echo.
echo เริ่มต้นการติดตั้งระบบ...
echo.

echo [1/8] ตรวจสอบระบบ...
echo - ตรวจสอบ Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo   ❌ Node.js ไม่ได้ติดตั้ง
    echo   📥 ติดตั้ง Node.js...
    call setup\install-nodejs.bat
) else (
    echo   ✅ Node.js ติดตั้งแล้ว
)

echo - ตรวจสอบ Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo   ❌ Docker ไม่ได้ติดตั้ง
    echo   📥 ติดตั้ง Docker...
    call setup\install-docker.bat
) else (
    echo   ✅ Docker ติดตั้งแล้ว
)

echo - ตรวจสอบ MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo   ❌ MySQL ไม่ได้ติดตั้ง
    echo   📥 ติดตั้ง MySQL...
    if exist "setup\install-mysql-windows.bat" (
        call setup\install-mysql-windows.bat
    ) else (
        echo   ⚠️ ไฟล์ install-mysql-windows.bat ไม่พบ
        echo   📋 ตรวจสอบโฟลเดอร์ setup...
        dir setup\*mysql*.bat
    )
) else (
    echo   ✅ MySQL ติดตั้งแล้ว
)

echo.
echo [2/8] ติดตั้ง Dependencies...
echo - ติดตั้ง Backend Dependencies...
if exist "backend" (
    cd backend
    call npm install
    cd ..
) else (
    echo   ⚠️ โฟลเดอร์ backend ไม่พบ
)

echo - ติดตั้ง Frontend Dependencies...
if exist "frontend" (
    cd frontend
    call npm install
    cd ..
) else (
    echo   ⚠️ โฟลเดอร์ frontend ไม่พบ
)

echo.
echo [3/8] ตั้งค่าฐานข้อมูล...
if exist "setup\setup-mysql-simple.bat" (
    call setup\setup-mysql-simple.bat
) else (
    echo   ⚠️ ไฟล์ setup-mysql-simple.bat ไม่พบ
)
if exist "setup\create-logs-database.bat" (
    call setup\create-logs-database.bat
) else (
    echo   ⚠️ ไฟล์ create-logs-database.bat ไม่พบ
)

echo.
echo [4/8] ตั้งค่า Environment Variables...
if exist "setup\create-backend-env.bat" (
    call setup\create-backend-env.bat
) else (
    echo   ⚠️ ไฟล์ create-backend-env.bat ไม่พบ
)
if exist "setup\create-frontend-env.bat" (
    call setup\create-frontend-env.bat
) else (
    echo   ⚠️ ไฟล์ create-frontend-env.bat ไม่พบ
)

echo.
echo [5/8] ตั้งค่า Docker Registry...
if exist "setup\setup-docker-registry.bat" (
    call setup\setup-docker-registry.bat
) else (
    echo   ⚠️ ไฟล์ setup-docker-registry.bat ไม่พบ
)

echo.
echo [6/8] ตั้งค่า Network Access...
if exist "setup\setup-network-access.bat" (
    call setup\setup-network-access.bat
) else (
    echo   ⚠️ ไฟล์ setup-network-access.bat ไม่พบ
)
if exist "setup\setup-firewall-rules.bat" (
    call setup\setup-firewall-rules.bat
) else (
    echo   ⚠️ ไฟล์ setup-firewall-rules.bat ไม่พบ
)

echo.
echo [7/8] Build ระบบ...
if exist "deployment\build-production.bat" (
    call deployment\build-production.bat
) else (
    echo   ⚠️ ไฟล์ build-production.bat ไม่พบ
    echo   📋 ตรวจสอบโฟลเดอร์ deployment...
    dir deployment\*build*.bat
)

echo.
echo [8/8] ทดสอบระบบ...
if exist "testing\test-database-connection.bat" (
    call testing\test-database-connection.bat
) else (
    echo   ⚠️ ไฟล์ test-database-connection.bat ไม่พบ
)
if exist "testing\check-docker-status.bat" (
    call testing\check-docker-status.bat
) else (
    echo   ⚠️ ไฟล์ check-docker-status.bat ไม่พบ
)
if exist "testing\test-network-access.bat" (
    call testing\test-network-access.bat
) else (
    echo   ⚠️ ไฟล์ test-network-access.bat ไม่พบ
)

echo.
echo ========================================
echo    การติดตั้งเสร็จสิ้น!
echo ========================================
echo.
echo ระบบพร้อมใช้งานแล้ว
echo.
echo คำสั่งที่แนะนำ:
echo - เริ่มต้นระบบ: scripts\quick-commands.bat
echo - จัดการระบบ: scripts\system-manager.bat
echo.
pause

:exit
echo.
echo การติดตั้งถูกยกเลิก
exit /b 0
