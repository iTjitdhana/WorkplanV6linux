@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    WorkplanV6 - System Manager
echo ========================================
echo.

:menu
echo เลือกการดำเนินการ:
echo 1. ตรวจสอบสถานะระบบ
echo 2. เริ่มต้นระบบทั้งหมด
echo 3. หยุดระบบทั้งหมด
echo 4. รีสตาร์ทระบบ
echo 5. แก้ไขปัญหาทั้งหมด
echo 6. อัปเดตระบบ
echo 7. สำรองข้อมูล
echo 8. กู้คืนข้อมูล
echo 9. ออกจากโปรแกรม
echo.
set /p choice="กรุณาเลือกตัวเลือก (1-9): "

if "%choice%"=="1" goto status
if "%choice%"=="2" goto startall
if "%choice%"=="3" goto stopall
if "%choice%"=="4" goto restart
if "%choice%"=="5" goto fixall
if "%choice%"=="6" goto update
if "%choice%"=="7" goto backup
if "%choice%"=="8" goto restore
if "%choice%"=="9" goto exit
goto invalid

:status
echo.
echo ตรวจสอบสถานะระบบ...
echo.
echo [1/4] ตรวจสอบ Docker...
if exist "testing\check-docker-status.bat" (
    call testing\check-docker-status.bat
) else (
    echo ไฟล์ check-docker-status.bat ไม่พบ
    echo ใช้ check-system.bat แทน...
    call testing\check-system.bat
)
echo.
echo [2/4] ตรวจสอบฐานข้อมูล...
if exist "testing\test-database-connection.bat" (
    call testing\test-database-connection.bat
) else (
    echo ไฟล์ test-database-connection.bat ไม่พบ
    echo ตรวจสอบโฟลเดอร์ testing...
    dir testing\*database*.bat
)
echo.
echo [3/4] ตรวจสอบ Network...
if exist "testing\check-network-access.bat" (
    call testing\check-network-access.bat
) else (
    echo ไฟล์ check-network-access.bat ไม่พบ
    echo ใช้ test-network-access.bat แทน...
    call testing\test-network-access.bat
)
echo.
echo [4/4] ตรวจสอบ Ports...
if exist "testing\check-server-ports.bat" (
    call testing\check-server-ports.bat
) else (
    echo ไฟล์ check-server-ports.bat ไม่พบ
    echo ตรวจสอบโฟลเดอร์ testing...
    dir testing\*port*.bat
)
echo.
echo การตรวจสอบเสร็จสิ้น
pause
goto menu

:startall
echo.
echo เริ่มต้นระบบทั้งหมด...
echo.
echo [1/3] เริ่มต้น Docker...
if exist "startup\start-docker.bat" (
    call startup\start-docker.bat
) else (
    echo ไฟล์ start-docker.bat ไม่พบ
    echo ตรวจสอบโฟลเดอร์ startup...
    dir startup\*docker*.bat
)
timeout /t 5 /nobreak >nul
echo.
echo [2/3] เริ่มต้น Backend...
if exist "startup\start-backend.bat" (
    call startup\start-backend.bat
) else (
    echo ไฟล์ start-backend.bat ไม่พบ
    echo ใช้ start-backend-simple.bat แทน...
    call startup\start-backend-simple.bat
)
timeout /t 5 /nobreak >nul
echo.
echo [3/3] เริ่มต้น Frontend...
if exist "startup\start-frontend.bat" (
    call startup\start-frontend.bat
) else (
    echo ไฟล์ start-frontend.bat ไม่พบ
    echo ใช้ start-frontend-simple.bat แทน...
    call startup\start-frontend-simple.bat
)
echo.
echo ระบบเริ่มต้นเสร็จสิ้น
pause
goto menu

:stopall
echo.
echo หยุดระบบทั้งหมด...
echo.
echo [1/3] หยุด Frontend...
call startup\stop-frontend.bat
echo.
echo [2/3] หยุด Backend...
call startup\stop-backend.bat
echo.
echo [3/3] หยุด Docker...
call startup\stop-docker.bat
echo.
echo ระบบหยุดเสร็จสิ้น
pause
goto menu

:restart
echo.
echo รีสตาร์ทระบบ...
call :stopall
timeout /t 3 /nobreak >nul
call :startall
goto menu

:fixall
echo.
echo แก้ไขปัญหาทั้งหมด...
echo.
echo [1/6] แก้ไขปัญหา Docker...
if exist "fixes\fix-docker-issues.bat" (
    call fixes\fix-docker-issues.bat
) else (
    echo ไฟล์ fix-docker-issues.bat ไม่พบ
    echo ตรวจสอบโฟลเดอร์ fixes...
    dir fixes\*docker*.bat
)
echo.
echo [2/6] แก้ไขปัญหา TypeScript...
if exist "fixes\fix-typescript-errors.bat" (
    call fixes\fix-typescript-errors.bat
) else (
    echo ไฟล์ fix-typescript-errors.bat ไม่พบ
    echo ใช้ fix-all-typescript.bat แทน...
    call fixes\fix-all-typescript.bat
)
echo.
echo [3/6] แก้ไขปัญหาฐานข้อมูล...
if exist "fixes\fix-database-connection.bat" (
    call fixes\fix-database-connection.bat
) else (
    echo ไฟล์ fix-database-connection.bat ไม่พบ
    echo ตรวจสอบโฟลเดอร์ database...
    dir database\*fix*.bat
)
echo.
echo [4/6] แก้ไขปัญหา Search...
if exist "fixes\fix-search-issue.bat" (
    call fixes\fix-search-issue.bat
) else (
    echo ไฟล์ fix-search-issue.bat ไม่พบ
    echo ใช้ fix-searchbox-add-new.bat แทน...
    call fixes\fix-searchbox-add-new.bat
)
echo.
echo [5/6] แก้ไขปัญหา Dropdown...
if exist "fixes\fix-dropdown-add-new.bat" (
    call fixes\fix-dropdown-add-new.bat
) else (
    echo ไฟล์ fix-dropdown-add-new.bat ไม่พบ
    echo ตรวจสอบโฟลเดอร์ fixes...
    dir fixes\*dropdown*.bat
)
echo.
echo [6/6] แก้ไขปัญหาทั้งหมด...
if exist "fixes\fix-all-issues.bat" (
    call fixes\fix-all-issues.bat
) else (
    echo ไฟล์ fix-all-issues.bat ไม่พบ
    echo ตรวจสอบโฟลเดอร์ fixes...
    dir fixes\*all*.bat
)
echo.
echo การแก้ไขปัญหาเสร็จสิ้น
pause
goto menu

:update
echo.
echo อัปเดตระบบ...
echo.
echo [1/3] อัปเดต Code...
call deployment\pull-and-update.bat
echo.
echo [2/3] Build ระบบใหม่...
call deployment\build-production.bat
echo.
echo [3/3] Deploy ระบบ...
call deployment\deploy-production.bat
echo.
echo การอัปเดตเสร็จสิ้น
pause
goto menu

:backup
echo.
echo สำรองข้อมูล...
echo.
set backupdir=backup\%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set backupdir=%backupdir: =0%
mkdir %backupdir% 2>nul
echo สำรองข้อมูลไปยัง: %backupdir%
call database\backup-database.bat %backupdir%
echo.
echo การสำรองข้อมูลเสร็จสิ้น
pause
goto menu

:restore
echo.
echo กู้คืนข้อมูล...
echo.
set /p restorepath="กรุณาใส่พาธของไฟล์สำรองข้อมูล: "
if exist "%restorepath%" (
    call database\restore-database.bat "%restorepath%"
    echo การกู้คืนข้อมูลเสร็จสิ้น
) else (
    echo ไม่พบไฟล์สำรองข้อมูลที่ระบุ
)
pause
goto menu

:invalid
echo.
echo ตัวเลือกไม่ถูกต้อง กรุณาเลือก 1-9
pause
goto menu

:exit
echo.
echo ขอบคุณที่ใช้งาน System Manager!
exit /b 0
