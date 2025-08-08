@echo off
echo ========================================
echo    ตั้งค่าระบบ Production Logs
echo ========================================
echo.

echo [1/4] ตรวจสอบการเชื่อมต่อฐานข้อมูล...
mysql -h 192.168.0.94 -u jitdhana -p'iT12345$' -e "USE esp_tracker; SELECT 'Database connection successful' as status;" 2>nul
if %errorlevel% neq 0 (
    echo ❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้
    echo กรุณาตรวจสอบ:
    echo - การเชื่อมต่อเครือข่าย
    echo - IP Address: 192.168.0.94
    echo - Username: jitdhana
    echo - Password: iT12345$
    pause
    exit /b 1
)
echo ✅ เชื่อมต่อฐานข้อมูลสำเร็จ

echo.
echo [2/4] สร้างตาราง production_logs...
mysql -h 192.168.0.94 -u jitdhana -p'iT12345$' esp_tracker < create-production-logs-table.sql
if %errorlevel% neq 0 (
    echo ❌ เกิดข้อผิดพลาดในการสร้างตาราง
    pause
    exit /b 1
)
echo ✅ สร้างตารางสำเร็จ

echo.
echo [3/4] ตรวจสอบข้อมูลตัวอย่าง...
mysql -h 192.168.0.94 -u jitdhana -p'iT12345$' -e "USE esp_tracker; SELECT COUNT(*) as total_records FROM production_logs;" 2>nul
if %errorlevel% neq 0 (
    echo ❌ ไม่พบข้อมูลในตาราง
    pause
    exit /b 1
)
echo ✅ พบข้อมูลในตาราง

echo.
echo [4/4] ตรวจสอบ View และ Trigger...
mysql -h 192.168.0.94 -u jitdhana -p'iT12345$' -e "USE esp_tracker; SELECT 'View and triggers created successfully' as status;" 2>nul
if %errorlevel% neq 0 (
    echo ❌ เกิดข้อผิดพลาดในการสร้าง View หรือ Trigger
    pause
    exit /b 1
)
echo ✅ สร้าง View และ Trigger สำเร็จ

echo.
echo ========================================
echo    ✅ ตั้งค่าระบบสำเร็จ!
echo ========================================
echo.
echo 📊 ตารางที่สร้าง:
echo    - production_logs (ตารางหลัก)
echo    - production_summary (View)
echo    - calculate_yield_percentage (Trigger)
echo    - update_yield_percentage (Trigger)
echo.
echo 🔗 API Endpoints:
echo    - GET /api/production-logs/latest
echo    - GET /api/production-logs
echo    - POST /api/production-logs
echo    - PUT /api/production-logs/[id]
echo    - DELETE /api/production-logs/[id]
echo    - GET /api/production-logs/stats/summary
echo    - GET /api/production-logs/stats/yield-analysis
echo.
echo 🚀 พร้อมใช้งานแล้ว!
echo.
pause
