@echo off
echo ========================================
echo อัปเดตตัวกรองวันที่ปัจจุบัน
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
echo - วันที่เริ่มต้นเป็นวันปัจจุบัน
echo - เพิ่มปุ่ม "วันนี้" สำหรับรีเซ็ตเป็นวันปัจจุบัน
echo - เพิ่มปุ่ม "รีเซ็ตตัวกรอง" สำหรับรีเซ็ตทั้งหมด
echo - แสดงวันที่ในรูปแบบภาษาไทย
echo - ไฮไลท์วันปัจจุบันด้วยสีน้ำเงิน
echo.
echo URLs:
echo - Dashboard: http://localhost:3011/dashboard
echo - Logs:      http://localhost:3011/logs
echo.
echo วิธีการใช้งาน:
echo 1. เมื่อเปิดหน้า Logs จะแสดงข้อมูลของวันปัจจุบัน
echo 2. คลิกปุ่ม "วันนี้" เพื่อรีเซ็ตเป็นวันปัจจุบัน
echo 3. คลิกปุ่ม "รีเซ็ตตัวกรอง" เพื่อรีเซ็ตทั้งหมด
echo 4. วันที่ปัจจุบันจะแสดงด้วยสีน้ำเงิน
echo.
pause 