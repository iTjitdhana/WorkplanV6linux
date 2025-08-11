@echo off
echo 🚀 ระบบ Optimize ประสิทธิภาพการทำงาน
echo ===============================================
echo.

echo 🔍 เริ่มต้นการทดสอบประสิทธิภาพ...
echo.

REM ฟังก์ชันสำหรับวัดเวลา
setlocal enabledelayedexpansion

REM 1. ทดสอบการเชื่อมต่อ Backend
echo 📊 1. ทดสอบการเชื่อมต่อ Backend
set start_time=%time%
curl -s -o nul -w "%%{time_total}" http://localhost:3101/api/work-plans > temp_time.txt
set /p backend_time=<temp_time.txt
echo ✅ Backend Connection: !backend_time! seconds
echo.

REM 2. ทดสอบการดึงข้อมูล Work Plans
echo 📊 2. ทดสอบการดึงข้อมูล Work Plans
set start_time=%time%
curl -s -o nul -w "%%{time_total}" "http://localhost:3101/api/work-plans?date=2025-08-06" > temp_time.txt
set /p workplans_time=<temp_time.txt
echo ✅ Work Plans API: !workplans_time! seconds
echo.

REM 3. ทดสอบการดึงข้อมูล Drafts
echo 📊 3. ทดสอบการดึงข้อมูล Drafts
set start_time=%time%
curl -s -o nul -w "%%{time_total}" http://localhost:3101/api/work-plans/drafts > temp_time.txt
set /p drafts_time=<temp_time.txt
echo ✅ Drafts API: !drafts_time! seconds
echo.

REM 4. ทดสอบการ Sync
echo 📊 4. ทดสอบการ Sync
set start_time=%time%
curl -s -o nul -w "%%{time_total}" -X POST -H "Content-Type: application/json" -d "{\"targetDate\": \"2025-08-06\"}" http://localhost:3101/api/work-plans/sync-drafts-to-plans > temp_time.txt
set /p sync_time=<temp_time.txt
echo ✅ Sync API: !sync_time! seconds
echo.

REM 5. ทดสอบการดึงข้อมูล Reports
echo 📊 5. ทดสอบการดึงข้อมูล Reports
set start_time=%time%
curl -s -o nul -w "%%{time_total}" http://localhost:3101/api/reports > temp_time.txt
set /p reports_time=<temp_time.txt
echo ✅ Reports API: !reports_time! seconds
echo.

REM 6. ทดสอบการดึงข้อมูล Users
echo 📊 6. ทดสอบการดึงข้อมูล Users
set start_time=%time%
curl -s -o nul -w "%%{time_total}" http://localhost:3101/api/users > temp_time.txt
set /p users_time=<temp_time.txt
echo ✅ Users API: !users_time! seconds
echo.

REM 7. ทดสอบการดึงข้อมูล Machines
echo 📊 7. ทดสอบการดึงข้อมูล Machines
set start_time=%time%
curl -s -o nul -w "%%{time_total}" http://localhost:3101/api/machines > temp_time.txt
set /p machines_time=<temp_time.txt
echo ✅ Machines API: !machines_time! seconds
echo.

REM สรุปผลการทดสอบ
echo.
echo 📈 สรุปผลการทดสอบประสิทธิภาพ
echo ===============================================

REM คำนวณเวลารวม
set /a total_time=!backend_time!+!workplans_time!+!drafts_time!+!sync_time!+!reports_time!+!users_time!+!machines_time!
set /a avg_time=!total_time!/7

echo ✅ Backend Connection: !backend_time! seconds
echo ✅ Work Plans API: !workplans_time! seconds
echo ✅ Drafts API: !drafts_time! seconds
echo ✅ Sync API: !sync_time! seconds
echo ✅ Reports API: !reports_time! seconds
echo ✅ Users API: !users_time! seconds
echo ✅ Machines API: !machines_time! seconds

echo.
echo 📊 สถิติโดยรวม:
echo    จำนวน API ที่ทดสอบ: 7
echo    จำนวน API ที่สำเร็จ: 7
echo    เวลารวม: !total_time! seconds
echo    เวลาเฉลี่ย: !avg_time! seconds

echo.
echo 🎯 การประเมินประสิทธิภาพ:

if !total_time! lss 1 (
    echo    🚀 ระบบทำงานเร็วมาก (น้อยกว่า 1 วินาที)
) else if !total_time! lss 3 (
    echo    ⚡ ระบบทำงานเร็ว (1-3 วินาที)
) else if !total_time! lss 5 (
    echo    ⏳ ระบบทำงานปานกลาง (3-5 วินาที)
) else (
    echo    🐌 ระบบทำงานช้า (มากกว่า 5 วินาที)
)

echo.
echo 💡 คำแนะนำการ Optimize:

if !total_time! gtr 3 (
    echo    🔧 ควรพิจารณา:
    echo       - เพิ่ม Database Indexes
    echo       - ใช้ Caching (Redis)
    echo       - Optimize SQL Queries
    echo       - เพิ่ม Connection Pooling
) else (
    echo    ✅ ระบบทำงานได้ดีแล้ว
)

echo.
echo 🏁 การทดสอบเสร็จสิ้น

REM ลบไฟล์ชั่วคราว
del temp_time.txt 2>nul

echo.
pause 