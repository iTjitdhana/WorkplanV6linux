@echo off
title WorkPlan V6 System Launcher
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                    WorkPlan V6                           ║
echo  ║              Production Tracking System                  ║
echo  ║                                                          ║
echo  ║           บริษัท จิตต์ธนา จำกัด (สำนักงานใหญ่)             ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

:MENU
echo  เลือกโหมดการรัน:
echo.
echo  [1] 🚀 Production Mode   - รันระบบจริง (Optimized)
echo  [2] 🔧 Development Mode  - รันระบบพัฒนา (Hot Reload)
echo  [3] 🧪 Test Database     - ทดสอบการเชื่อมต่อฐานข้อมูล
echo  [4] 📊 System Status     - ตรวจสอบสถานะระบบ
echo  [5] 🛠️  Maintenance      - เครื่องมือบำรุงรักษา
echo  [6] ❌ Exit             - ออกจากโปรแกรม
echo.
set /p choice="เลือกตัวเลือก (1-6): "

if "%choice%"=="1" goto PRODUCTION
if "%choice%"=="2" goto DEVELOPMENT
if "%choice%"=="3" goto TEST_DB
if "%choice%"=="4" goto STATUS
if "%choice%"=="5" goto MAINTENANCE
if "%choice%"=="6" goto EXIT
echo ❌ ตัวเลือกไม่ถูกต้อง
goto MENU

:PRODUCTION
echo.
echo 🚀 เริ่มระบบ Production Mode...
call scripts\run-production.bat
goto MENU

:DEVELOPMENT
echo.
echo 🔧 เริ่มระบบ Development Mode...
call scripts\run-development.bat
goto MENU

:TEST_DB
echo.
echo 🧪 ทดสอบการเชื่อมต่อฐานข้อมูล...
cd backend
node test-db-connection.js
cd ..
echo.
pause
goto MENU

:STATUS
echo.
echo 📊 ตรวจสอบสถานะระบบ...
echo.
echo Backend Port 3102:
netstat -an | findstr :3102
echo.
echo Frontend Port 3012:
netstat -an | findstr :3012
echo.
echo Database Connection:
cd backend
node -e "const {testConnection} = require('./config/database'); testConnection();"
cd ..
echo.
pause
goto MENU

:MAINTENANCE
echo.
echo 🛠️ เครื่องมือบำรุงรักษา:
echo.
echo  [1] 🧹 ล้าง Cache และ Build Files
echo  [2] 🔄 รีสตาร์ท Services
echo  [3] 📦 อัปเดต Dependencies
echo  [4] 🗄️ Backup Database
echo  [5] 🔙 กลับเมนูหลัก
echo.
set /p maint_choice="เลือกตัวเลือก (1-5): "

if "%maint_choice%"=="1" goto CLEAN
if "%maint_choice%"=="2" goto RESTART
if "%maint_choice%"=="3" goto UPDATE
if "%maint_choice%"=="4" goto BACKUP
if "%maint_choice%"=="5" goto MENU
echo ❌ ตัวเลือกไม่ถูกต้อง
goto MAINTENANCE

:CLEAN
echo 🧹 ล้าง Cache และ Build Files...
if exist "frontend\.next" rmdir /s /q "frontend\.next"
if exist "frontend\out" rmdir /s /q "frontend\out"
if exist "backend\logs" rmdir /s /q "backend\logs"
echo ✅ ล้าง Cache เสร็จสิ้น
pause
goto MAINTENANCE

:RESTART
echo 🔄 รีสตาร์ท Services...
taskkill /f /im node.exe 2>nul || echo "No Node.js processes found"
timeout /t 2 >nul
echo ✅ รีสตาร์ทเสร็จสิ้น
pause
goto MAINTENANCE

:UPDATE
echo 📦 อัปเดต Dependencies...
echo Backend:
cd backend && npm update && cd ..
echo Frontend:
cd frontend && npm update && cd ..
echo ✅ อัปเดตเสร็จสิ้น
pause
goto MAINTENANCE

:BACKUP
echo 🗄️ Backup Database...
echo ⚠️ Feature นี้ต้องติดตั้ง MySQL tools ก่อน
pause
goto MAINTENANCE

:EXIT
echo.
echo 👋 ขอบคุณที่ใช้ WorkPlan V6
echo.
exit /b 0




