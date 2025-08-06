@echo off
echo ========================================
echo อัปเดต Font เป็น Noto Sans Thai
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
echo อัปเดต Font เรียบร้อย!
echo ========================================
echo.
echo ระบบจะใช้ Noto Sans Thai font สำหรับ:
echo - ข้อความภาษาไทย
echo - ข้อความภาษาอังกฤษ
echo - UI Components ทั้งหมด
echo.
echo URLs:
echo - Dashboard: http://localhost:3011/dashboard
echo - Logs:      http://localhost:3011/logs
echo.
echo หากต้องการปรับแต่ง font เพิ่มเติม:
echo 1. แก้ไขใน tailwind.config.ts
echo 2. แก้ไขใน app/layout.tsx
echo 3. แก้ไขใน app/globals.css
echo.
pause 