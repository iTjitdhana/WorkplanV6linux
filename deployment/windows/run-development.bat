@echo off
echo ===============================================
echo    WorkPlan V6 - Development System Launcher
echo ===============================================
echo.

:: ตรวจสอบ Node.js
echo [1/4] ตรวจสอบ Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js ไม่พบ กรุณาติดตั้ง Node.js ก่อน
    pause
    exit /b 1
)
echo ✅ Node.js พร้อมใช้งาน

:: ตรวจสอบ Dependencies
echo [2/4] ตรวจสอบ Dependencies...
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

:: เริ่ม Backend Development Server
echo [3/4] เริ่ม Backend Development Server...
start "Backend Dev Server" cmd /k "cd backend && npm run dev"
timeout /t 3 >nul

:: เริ่ม Frontend Development Server
echo [4/4] เริ่ม Frontend Development Server...
start "Frontend Dev Server" cmd /k "cd frontend && npm run dev"

echo.
echo 🚀 ระบบ Development เริ่มทำงานแล้ว!
echo.
echo 📊 เข้าใช้งานได้ที่:
echo    Frontend: http://localhost:3012
echo    Backend:  http://localhost:3102
echo.
echo 🔧 โหมด Development:
echo    - Hot reload enabled
echo    - Debug logs enabled
echo    - Auto restart on file changes
echo.
echo 💡 กด Ctrl+C ในหน้าต่าง server เพื่อหยุดระบบ
echo.
pause




