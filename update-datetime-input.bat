@echo off
echo ========================================
echo อัปเดต Input วันที่และเวลา
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
echo 3. เริ่มต้น Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 4. รอให้ server เริ่มต้น...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo อัปเดตเรียบร้อย!
echo ========================================
echo.
echo การเปลี่ยนแปลง:
echo - แยกการแก้ไขวันที่และเวลา
echo - วันที่: ใช้ date picker
echo - เวลา: ใช้ text input แบบพิมพ์ได้ (HH:mm:ss)
echo.
echo URLs:
echo - Dashboard: http://localhost:3011/dashboard
echo - Logs:      http://localhost:3011/logs
echo.
echo วิธีการใช้งาน:
echo 1. คลิก "เพิ่ม Log" หรือ "แก้ไข Log"
echo 2. เลือกวันที่จาก date picker
echo 3. พิมพ์เวลาในรูปแบบ HH:mm:ss (เช่น 16:01:32)
echo.
pause 