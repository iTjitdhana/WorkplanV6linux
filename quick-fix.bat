@echo off
echo ========================================
echo Quick Fix for Production Build Issues
echo ========================================

echo.
echo [1/4] Cleaning up...
cd frontend
if exist .next rmdir /s /q .next
if exist node_modules rmdir /s /q node_modules

echo.
echo [2/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Building for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Starting production servers...
cd ..
call start-production.bat

echo.
echo ========================================
echo ✅ Quick fix completed!
echo ========================================
