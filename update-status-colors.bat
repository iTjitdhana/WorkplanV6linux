@echo off
echo ========================================
echo 🎨 อัปเดตสีสถานะใน Database
echo ========================================

echo.
echo 🔄 กำลังอัปเดตสี "กำลังดำเนินการ" เป็นสีเหลือง...

REM ตรวจสอบว่า MySQL อยู่ใน PATH หรือไม่
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ไม่พบ MySQL ใน PATH
    echo 💡 ลองใช้ MySQL Workbench หรือ phpMyAdmin แทน
    echo.
    echo 📋 SQL ที่ต้องรัน:
    echo UPDATE production_statuses SET color = '#F59E0B' WHERE name = 'กำลังดำเนินการ';
    echo.
    pause
    exit /b 1
)

REM รัน SQL command
mysql -u root -p -e "USE workplan; UPDATE production_statuses SET color = '#F59E0B' WHERE name = 'กำลังดำเนินการ'; SELECT id, name, color FROM production_statuses WHERE name IN ('รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิกการผลิต') ORDER BY id;"

if %errorlevel% equ 0 (
    echo.
    echo ✅ อัปเดตสีสำเร็จ!
    echo.
    echo 🔄 กรุณา refresh หน้าเว็บเพื่อดูผลลัพธ์
) else (
    echo.
    echo ❌ อัปเดตสีล้มเหลว!
    echo 💡 ลองใช้ MySQL Workbench หรือ phpMyAdmin แทน
)

echo.
pause 