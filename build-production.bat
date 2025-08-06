@echo off
chcp 65001 >nul
echo Building Production System
echo ========================

echo Step 1: Installing dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Step 2: Building Frontend for Production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)

cd ..
echo ✅ Frontend built successfully!

echo.
echo Step 3: Installing Backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✅ Backend dependencies installed!

echo.
echo 🎉 Production build completed!
echo Ready to start production servers with: start-production.bat

pause 