@echo off
echo ===============================================
echo    WorkPlan V6 - Production System Launcher
echo ===============================================
echo.

:: ตรวจสอบ Node.js
echo [1/5] ตรวจสอบ Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js ไม่พบ กรุณาติดตั้ง Node.js ก่อน
    pause
    exit /b 1
)
echo ✅ Node.js พร้อมใช้งาน

:: ตรวจสอบ Dependencies
echo [2/5] ตรวจสอบ Dependencies...
if not exist "backend\node_modules" (
    echo 📦 ติดตั้ง Backend Dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo 📦 ติดตั้ง Frontend Dependencies...
    cd frontend
    call npm install
    cd ..
)
echo ✅ Dependencies พร้อมใช้งาน

:: Build Frontend
echo [3/5] Build Frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build ล้มเหลว
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Frontend build สำเร็จ

:: เริ่ม Backend Server
echo [4/5] เริ่ม Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 >nul

:: เริ่ม Frontend Server
echo [5/5] เริ่ม Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo 🚀 ระบบเริ่มทำงานแล้ว!
echo.
echo 📊 เข้าใช้งานได้ที่:
echo    Frontend: http://localhost:3012
echo    Backend:  http://localhost:3102
echo.
echo 💡 กด Ctrl+C ในหน้าต่าง server เพื่อหยุดระบบ
echo.
pause