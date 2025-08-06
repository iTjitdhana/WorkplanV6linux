@echo off
echo ========================================
echo อัปเดตระบบจัดการงานใหม่
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
echo - เพิ่มหน้า "จัดการงานใหม่" สำหรับงานที่มี job_code = "NEW"
echo - สามารถแก้ไขรหัสงาน ชื่องาน และ Process Steps ได้
echo - เพิ่ม Backend API สำหรับจัดการงานใหม่
echo - เพิ่มลิงก์ในหน้า Dashboard
echo.
echo URLs:
echo - Dashboard:        http://localhost:3011/dashboard
echo - จัดการงานใหม่:     http://localhost:3011/manage-new-jobs
echo - Logs:            http://localhost:3011/logs
echo.
echo วิธีการใช้งาน:
echo 1. เข้าไปที่หน้า "จัดการงานใหม่" จาก Dashboard
echo 2. ดูรายการงานที่มี job_code = "NEW"
echo 3. คลิก "แก้ไข" เพื่อเปลี่ยนรหัสงาน ชื่องาน และ Process Steps
echo 4. เพิ่ม/ลบ Process Steps ตามต้องการ
echo 5. กด "บันทึกการเปลี่ยนแปลง" เพื่ออัปเดตฐานข้อมูล
echo.
echo ฟีเจอร์:
echo - แสดงรายการงานที่มี job_code = "NEW"
echo - แก้ไขรหัสงานและชื่องาน
echo - จัดการ Process Steps (เพิ่ม/ลบ/แก้ไข)
echo - ลบงานที่ไม่ต้องการ
echo - อัปเดตฐานข้อมูลแบบ Transaction
echo.
pause 