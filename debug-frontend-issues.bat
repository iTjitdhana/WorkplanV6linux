@echo off
echo ========================================
echo 🔍 ตรวจสอบปัญหา Frontend
echo ========================================

echo.
echo 📋 ปัญหาที่พบ:
echo - Backend API ทำงานได้แล้ว
echo - แต่ Frontend ยังไม่สามารถลบ/บันทึกได้
echo.

echo 🔧 ตรวจสอบ Frontend Server...
netstat -an | findstr :3011
if %errorlevel% equ 0 (
    echo ✅ Frontend server ทำงานอยู่ที่ port 3011
) else (
    echo ❌ Frontend server ไม่ทำงาน
    echo.
    echo 💡 วิธีแก้ไข:
    echo 1. รัน frontend server: cd frontend && npm run dev
    echo 2. หรือใช้: .\start-dev-windows.bat
    pause
    exit /b 1
)

echo.
echo 🔧 ตรวจสอบ Database...
echo 💡 ตรวจสอบข้อมูลในตาราง work_plan_drafts

echo.
echo 🔧 ทดสอบ API Response...
echo 📝 ทดสอบ GET /api/work-plans/drafts response
curl -s "http://localhost:3101/api/work-plans/drafts" | findstr "data"
if %errorlevel% equ 0 (
    echo ✅ GET response มีข้อมูล
) else (
    echo ❌ GET response ไม่มีข้อมูล
)

echo.
echo 🔧 ตรวจสอบ Frontend API Proxy...
echo 📝 ทดสอบ Frontend API proxy
curl -s "http://localhost:3011/api/work-plans/drafts" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend API proxy ทำงานได้
) else (
    echo ❌ Frontend API proxy ไม่ทำงาน
)

echo.
echo 💡 วิธีแก้ไขปัญหา:

echo.
echo 1. ตรวจสอบ Console ใน Browser:
echo - เปิด http://localhost:3011
echo - เปิด Developer Tools (F12)
echo - ไปที่ Console tab
echo - ทดสอบลบงานและดู error messages

echo.
echo 2. ตรวจสอบ Network Tab:
echo - ไปที่ Network tab ใน Developer Tools
echo - ทดสอบลบงานและดู API calls
echo - ตรวจสอบ response status และ data

echo.
echo 3. ตรวจสอบ Database Data:
echo - ตรวจสอบว่าตาราง work_plan_drafts มีข้อมูล
echo - ตรวจสอบว่า draft ID ที่ส่งไปมีอยู่จริง

echo.
echo 4. ทดสอบ API Response:
echo curl "http://localhost:3101/api/work-plans/drafts"
echo curl -X DELETE "http://localhost:3101/api/work-plans/drafts/1"
echo curl -X PUT "http://localhost:3101/api/work-plans/drafts/1" -H "Content-Type: application/json" -d "{\"job_name\":\"test\"}"

echo.
echo 5. ตรวจสอบ Frontend Code:
echo - ตรวจสอบ handleDeleteDraft function
echo - ตรวจสอบ handleSaveEditDraft function
echo - ตรวจสอบ draft ID ที่ส่งไป

echo.
pause 