@echo off
echo ========================================
echo อัปเดต Calendar Picker
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
echo - ใช้ Calendar Picker แทนการพิมพ์วันที่
echo - แสดงผลในรูปแบบ dd/mm/yyyy
echo - ใช้งานง่ายด้วยการคลิกเลือกวันที่
echo - รองรับทั้งส่วนตัวกรองและ Popup
echo.
echo URLs:
echo - Dashboard: http://localhost:3011/dashboard
echo - Logs:      http://localhost:3011/logs
echo.
echo วิธีการใช้งาน:
echo 1. คลิกที่ปุ่มวันที่เพื่อเปิด Calendar
echo 2. เลือกวันที่ที่ต้องการ
echo 3. วันที่จะแสดงในรูปแบบ 31/07/2025
echo 4. คลิกปุ่ม "วันนี้" เพื่อรีเซ็ตเป็นวันปัจจุบัน
echo.
pause 