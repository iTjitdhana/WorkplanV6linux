@echo off
echo ========================================
echo อัปเดตรูปแบบวันที่และเลย์เอาต์
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
echo - วันที่แสดงในรูปแบบ dd/mm/yyyy
echo - ย้ายปุ่ม "รีเซ็ตตัวกรอง" ไปอยู่ข้างๆ คำว่า "ตัวกรอง"
echo - เพิ่มการแสดงวันที่ในรูปแบบ dd/mm/yyyy ในส่วนสรุป
echo - รองรับการพิมพ์วันที่ในรูปแบบ dd/mm/yyyy
echo.
echo URLs:
echo - Dashboard: http://localhost:3011/dashboard
echo - Logs:      http://localhost:3011/logs
echo.
echo วิธีการใช้งาน:
echo 1. วันที่จะแสดงในรูปแบบ 31/07/2025
echo 2. สามารถพิมพ์วันที่ในรูปแบบ dd/mm/yyyy ได้
echo 3. ปุ่ม "รีเซ็ตตัวกรอง" อยู่ข้างๆ คำว่า "ตัวกรอง"
echo 4. ส่วนสรุปจะแสดงทั้งรูปแบบ dd/mm/yyyy และภาษาไทย
echo.
pause 