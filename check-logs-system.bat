@echo off
echo ========================================
echo ตรวจสอบสถานะระบบจัดการ Logs
echo ========================================

echo.
echo 1. ตรวจสอบ MySQL...
net start MySQL80 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✓ MySQL ทำงานอยู่
) else (
    echo    ✗ MySQL ไม่ทำงาน
)

echo.
echo 2. ตรวจสอบ Backend Server...
curl -s http://localhost:3001/api/logs >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✓ Backend Server ทำงานอยู่ (http://localhost:3001)
) else (
    echo    ✗ Backend Server ไม่ทำงาน
)

echo.
echo 3. ตรวจสอบ Frontend Server...
curl -s http://localhost:3011 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✓ Frontend Server ทำงานอยู่ (http://localhost:3011)
) else (
    echo    ✗ Frontend Server ไม่ทำงาน
)

echo.
echo ========================================
echo สรุปสถานะ
echo ========================================
echo.
echo URLs ที่สำคัญ:
echo - Dashboard: http://localhost:3011/dashboard
echo - Logs:      http://localhost:3011/logs
echo - Tracker:   http://localhost:3011/tracker
echo.
echo หากมีปัญหา ให้รัน start-logs-system.bat
echo.
pause 