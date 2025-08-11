@echo off
echo ========================================
echo แก้ไขปัญหา Logs Page Error
echo ========================================

echo.
echo 1. หยุด Frontend Server...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 2. ล้าง Next.js cache...
cd frontend
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 3. ติดตั้ง dependencies ใหม่...
npm install

echo.
echo 4. เริ่มต้น Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 5. รอให้ server เริ่มต้น...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo แก้ไขปัญหาเรียบร้อย!
echo ========================================
echo.
echo หน้า Logs: http://localhost:3011/logs
echo Dashboard: http://localhost:3011/dashboard
echo.
echo หากยังมีปัญหา ให้ตรวจสอบ:
echo 1. Backend server ทำงานอยู่ที่ port 3001
echo 2. MySQL ทำงานอยู่
echo 3. ตรวจสอบ console ใน browser
echo.
pause 