@echo off
echo ========================================
echo แก้ไขปัญหา Error ระบบจัดการงานใหม่
echo ========================================

echo.
echo 1. หยุด Frontend Server ที่รันอยู่...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 2. เริ่มต้น Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo 3. รอให้ Backend server เริ่มต้น...
timeout /t 15 /nobreak >nul

echo.
echo 4. เริ่มต้น Frontend Server...
cd ..
cd frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo 5. รอให้ Frontend server เริ่มต้น...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo การแก้ไขปัญหาเสร็จสิ้น!
echo ========================================
echo.
echo ขั้นตอนการตรวจสอบ:
echo 1. เปิดหน้า: http://localhost:3011/manage-new-jobs
echo 2. ตรวจสอบว่าไม่มี error ใน console
echo 3. ตรวจสอบว่า Backend server รันที่ port 3000
echo 4. ตรวจสอบว่า Frontend server รันที่ port 3011
echo.
echo หากยังมีปัญหา:
echo 1. ตรวจสอบ database connection
echo 2. ตรวจสอบว่ามีข้อมูลในตาราง work_plans ที่มี job_code = 'NEW'
echo 3. ตรวจสอบ console ของ Backend server
echo.
echo ข้อมูลที่ใช้:
echo - ตาราง: work_plans (สำหรับข้อมูลงาน)
echo - ตาราง: process_steps (สำหรับขั้นตอนการทำงาน)
echo - เงื่อนไข: job_code = 'NEW'
echo.
pause 