@echo off
echo ========================================
echo    WorkplanV6 - Quick Commands Menu
echo ========================================
echo.
echo เลือกตัวเลือก:
echo 1. เริ่มต้นระบบ (Quick Start)
echo 2. เริ่มต้น Docker
echo 3. เริ่มต้น Backend
echo 4. เริ่มต้น Frontend
echo 5. ทดสอบระบบ
echo 6. แก้ไขปัญหา
echo 7. Deploy ระบบ
echo 8. จัดการฐานข้อมูล
echo 9. ออกจากโปรแกรม
echo.
set /p choice="กรุณาเลือกตัวเลือก (1-9): "

if "%choice%"=="1" goto quickstart
if "%choice%"=="2" goto docker
if "%choice%"=="3" goto backend
if "%choice%"=="4" goto frontend
if "%choice%"=="5" goto test
if "%choice%"=="6" goto fix
if "%choice%"=="7" goto deploy
if "%choice%"=="8" goto database
if "%choice%"=="9" goto exit
goto invalid

:quickstart
echo.
echo เริ่มต้นระบบแบบรวดเร็ว...
if exist "scripts\startup\quick-start.bat" (
    call scripts\startup\quick-start.bat
) else (
    echo ไฟล์ quick-start.bat ไม่พบ
    echo ใช้ quick-start-simple.bat แทน...
    call scripts\startup\quick-start-simple.bat
)
goto end

:docker
echo.
echo เริ่มต้น Docker...
if exist "scripts\startup\start-docker.bat" (
    call scripts\startup\start-docker.bat
) else (
    echo ไฟล์ start-docker.bat ไม่พบ
    echo ตรวจสอบโฟลเดอร์ docker...
    dir scripts\startup\*docker*.bat
)
goto end

:backend
echo.
echo เริ่มต้น Backend...
if exist "scripts\startup\start-backend.bat" (
    call scripts\startup\start-backend.bat
) else (
    echo ไฟล์ start-backend.bat ไม่พบ
    echo ใช้ start-backend-simple.bat แทน...
    call scripts\startup\start-backend-simple.bat
)
goto end

:frontend
echo.
echo เริ่มต้น Frontend...
if exist "scripts\startup\start-frontend.bat" (
    call scripts\startup\start-frontend.bat
) else (
    echo ไฟล์ start-frontend.bat ไม่พบ
    echo ใช้ start-frontend-simple.bat แทน...
    call scripts\startup\start-frontend-simple.bat
)
goto end

:test
echo.
echo ทดสอบระบบ...
if exist "scripts\testing\test-database-connection.bat" (
    call scripts\testing\test-database-connection.bat
) else (
    echo ไฟล์ test-database-connection.bat ไม่พบ
)
if exist "scripts\testing\check-docker-status.bat" (
    call scripts\testing\check-docker-status.bat
) else (
    echo ไฟล์ check-docker-status.bat ไม่พบ
    echo ใช้ check-system.bat แทน...
    if exist "scripts\testing\check-system.bat" (
        call scripts\testing\check-system.bat
    ) else (
        echo ไฟล์ check-system.bat ไม่พบ
        echo ใช้ test-network-access.bat แทน...
        if exist "scripts\testing\test-network-access.bat" (
            call scripts\testing\test-network-access.bat
        ) else (
            echo ไม่พบไฟล์ทดสอบใดๆ
        )
    )
)
goto end

:fix
echo.
echo แก้ไขปัญหา...
echo เลือกปัญหาที่ต้องการแก้ไข:
echo 1. ปัญหา Docker
echo 2. ปัญหา TypeScript
echo 3. ปัญหาฐานข้อมูล
echo 4. ปัญหา Search
set /p fixchoice="เลือก (1-4): "
if "%fixchoice%"=="1" (
    if exist "fixes\fix-docker-issues.bat" (
        call fixes\fix-docker-issues.bat
    ) else (
        echo ไฟล์ fix-docker-issues.bat ไม่พบ
        echo ตรวจสอบโฟลเดอร์ fixes...
        dir fixes\*docker*.bat
    )
)
if "%fixchoice%"=="2" (
    if exist "fixes\fix-typescript-errors.bat" (
        call fixes\fix-typescript-errors.bat
    ) else (
        echo ไฟล์ fix-typescript-errors.bat ไม่พบ
        echo ใช้ fix-all-typescript.bat แทน...
        call fixes\fix-all-typescript.bat
    )
)
if "%fixchoice%"=="3" (
    if exist "fixes\fix-database-connection.bat" (
        call fixes\fix-database-connection.bat
    ) else (
        echo ไฟล์ fix-database-connection.bat ไม่พบ
        echo ตรวจสอบโฟลเดอร์ database...
        dir database\*fix*.bat
    )
)
if "%fixchoice%"=="4" (
    if exist "fixes\fix-search-issue.bat" (
        call fixes\fix-search-issue.bat
    ) else (
        echo ไฟล์ fix-search-issue.bat ไม่พบ
        echo ใช้ fix-searchbox-add-new.bat แทน...
        call fixes\fix-searchbox-add-new.bat
    )
)
goto end

:deploy
echo.
echo Deploy ระบบ...
if exist "deployment\deploy-production.bat" (
    call deployment\deploy-production.bat
) else (
    echo ไฟล์ deploy-production.bat ไม่พบ
    echo ตรวจสอบโฟลเดอร์ deployment...
    dir deployment\*deploy*.bat
)
goto end

:database
echo.
echo จัดการฐานข้อมูล...
echo เลือกการดำเนินการ:
echo 1. ติดตั้ง MySQL
echo 2. ทดสอบการเชื่อมต่อ
echo 3. สร้างฐานข้อมูล
set /p dbchoice="เลือก (1-3): "
if "%dbchoice%"=="1" (
    if exist "setup\setup-mysql-simple.bat" (
        call setup\setup-mysql-simple.bat
    ) else (
        echo ไฟล์ setup-mysql-simple.bat ไม่พบ
        echo ตรวจสอบโฟลเดอร์ setup...
        dir setup\*mysql*.bat
    )
)
if "%dbchoice%"=="2" (
    if exist "testing\test-database-connection.bat" (
        call testing\test-database-connection.bat
    ) else (
        echo ไฟล์ test-database-connection.bat ไม่พบ
        echo ตรวจสอบโฟลเดอร์ testing...
        dir testing\*database*.bat
    )
)
if "%dbchoice%"=="3" (
    if exist "setup\create-logs-database.bat" (
        call setup\create-logs-database.bat
    ) else (
        echo ไฟล์ create-logs-database.bat ไม่พบ
        echo ตรวจสอบโฟลเดอร์ setup...
        dir setup\*create*.bat
    )
)
goto end

:invalid
echo.
echo ตัวเลือกไม่ถูกต้อง กรุณาเลือก 1-9
pause
goto menu

:exit
echo.
echo ขอบคุณที่ใช้งาน!
exit /b 0

:end
echo.
echo การดำเนินการเสร็จสิ้น
pause
