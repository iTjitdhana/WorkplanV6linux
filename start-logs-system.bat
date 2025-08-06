@echo off
echo ========================================
echo ระบบจัดการ Logs - เริ่มต้นระบบ
echo ========================================

echo.
echo 1. ตรวจสอบ MySQL...
net start MySQL80 >nul 2>&1
if %errorlevel% neq 0 (
    echo    MySQL ไม่ทำงาน กำลังเริ่มต้น...
    net start MySQL80
) else (
    echo    MySQL ทำงานอยู่แล้ว
)

echo.
echo 2. เริ่มต้น Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo 3. รอ Backend เริ่มต้น...
timeout /t 5 /nobreak >nul

echo.
echo 4. เริ่มต้น Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo ระบบเริ่มต้นเรียบร้อย!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3011
echo Dashboard: http://localhost:3011/dashboard
echo Logs:      http://localhost:3011/logs
echo.
echo กด Enter เพื่อปิดหน้าต่างนี้...
pause >nul 