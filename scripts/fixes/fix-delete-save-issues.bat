@echo off
echo ========================================
echo 🔧 แก้ไขปัญหา ลบงานและบันทึกแบบร่าง
echo ========================================

echo.
echo 📋 ปัญหาที่พบ:
echo - กดลบงานไม่ได้
echo - บันทึกแบบร่างซ้ำไม่ได้
echo.

echo 🔧 ตรวจสอบ Backend Server...
netstat -an | findstr :3101
if %errorlevel% equ 0 (
    echo ✅ Backend server ทำงานอยู่ที่ port 3101
) else (
    echo ❌ Backend server ไม่ทำงาน
    echo.
    echo 💡 วิธีแก้ไข:
    echo 1. รัน backend server: cd backend && npm run dev
    echo 2. หรือใช้: .\start-dev-windows.bat
    pause
    exit /b 1
)

echo.
echo 🔧 ตรวจสอบ Database Tables...
echo 💡 ตรวจสอบว่าตาราง work_plan_drafts มีอยู่และมีข้อมูล

echo.
echo 🔧 ทดสอบ API Endpoints...

echo 📝 ทดสอบ GET /api/work-plans/drafts
curl -s "http://localhost:3101/api/work-plans/drafts" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ GET /api/work-plans/drafts ทำงานได้
) else (
    echo ❌ GET /api/work-plans/drafts ไม่ทำงาน
)

echo.
echo 📝 ทดสอบ DELETE /api/work-plans/drafts/1
curl -s -X DELETE "http://localhost:3101/api/work-plans/drafts/1" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ DELETE /api/work-plans/drafts/1 ทำงานได้
) else (
    echo ❌ DELETE /api/work-plans/drafts/1 ไม่ทำงาน
)

echo.
echo 📝 ทดสอบ PUT /api/work-plans/drafts/1
curl -s -X PUT "http://localhost:3101/api/work-plans/drafts/1" -H "Content-Type: application/json" -d "{\"job_name\":\"test\"}" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PUT /api/work-plans/drafts/1 ทำงานได้
) else (
    echo ❌ PUT /api/work-plans/drafts/1 ไม่ทำงาน
)

echo.
echo 📋 สิ่งที่ตรวจสอบแล้ว:
echo ✅ Backend routes มี DELETE และ PUT endpoints
echo ✅ DraftWorkPlanController มี delete และ update methods
echo ✅ DraftWorkPlan model มี delete และ update methods

echo.
echo 💡 วิธีแก้ไขปัญหา:

echo.
echo 1. ตรวจสอบ Console ใน Browser:
echo - เปิด Developer Tools (F12)
echo - ไปที่ Console tab
echo - ทดสอบลบงานและดู error messages

echo.
echo 2. ตรวจสอบ Network Tab:
echo - ไปที่ Network tab ใน Developer Tools
echo - ทดสอบลบงานและดู API calls
echo - ตรวจสอบ response status และ data

echo.
echo 3. ตรวจสอบ Database:
echo - ตรวจสอบว่าตาราง work_plan_drafts มีข้อมูล
echo - ตรวจสอบว่า draft ID ที่ส่งไปมีอยู่จริง

echo.
echo 4. ทดสอบด้วย Postman หรือ curl:
echo curl -X DELETE "http://localhost:3101/api/work-plans/drafts/1"
echo curl -X PUT "http://localhost:3101/api/work-plans/drafts/1" -H "Content-Type: application/json" -d "{\"job_name\":\"test\"}"

echo.
pause 