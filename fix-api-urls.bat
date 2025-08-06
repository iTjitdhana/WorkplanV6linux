@echo off
echo ========================================
echo 🔧 แก้ไข API URLs จาก IP เป็น localhost
echo ========================================

echo.
echo 📋 ปัญหาที่พบ:
echo - Frontend API proxy ใช้ IP address แทน localhost
echo - ทำให้ไม่สามารถเชื่อมต่อกับ backend ได้
echo.

echo 🔧 แก้ไขไฟล์ API proxy...

echo 📝 แก้ไข work-plans/drafts/[id]/route.ts
powershell -Command "(Get-Content 'frontend\app\api\work-plans\drafts\[id]\route.ts') -replace '192\.168\.0\.94:3101', 'localhost:3101' | Set-Content 'frontend\app\api\work-plans\drafts\[id]\route.ts'"

echo 📝 แก้ไข work-plans/drafts/route.ts
powershell -Command "(Get-Content 'frontend\app\api\work-plans\drafts\route.ts') -replace '192\.168\.0\.94:3101', 'localhost:3101' | Set-Content 'frontend\app\api\work-plans\drafts\route.ts'"

echo 📝 แก้ไข work-plans/route.ts
powershell -Command "(Get-Content 'frontend\app\api\work-plans\route.ts') -replace '192\.168\.0\.94:3101', 'localhost:3101' | Set-Content 'frontend\app\api\work-plans\route.ts'"

echo 📝 แก้ไข process-steps/search/route.ts
powershell -Command "(Get-Content 'frontend\app\api\process-steps\search\route.ts') -replace '192\.168\.0\.94:3101', 'localhost:3101' | Set-Content 'frontend\app\api\process-steps\search\route.ts'"

echo.
echo ✅ แก้ไข API URLs สำเร็จ!
echo.
echo 💡 ไฟล์ที่แก้ไขแล้ว:
echo - frontend/app/api/work-plans/drafts/[id]/route.ts
echo - frontend/app/api/work-plans/drafts/route.ts
echo - frontend/app/api/work-plans/route.ts
echo - frontend/app/api/process-steps/search/route.ts

echo.
echo 🔄 กรุณารีสตาร์ท Frontend Server:
echo 1. หยุด Frontend server (Ctrl+C)
echo 2. รันใหม่: cd frontend && npm run dev
echo 3. หรือใช้: .\start-dev-windows.bat

echo.
pause 