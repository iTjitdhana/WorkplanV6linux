@echo off
echo ========================================
echo Simple Frontend Build (No CSS Optimization)
echo ========================================

echo.
echo [1/3] Cleaning up...
cd frontend
if exist .next rmdir /s /q .next

echo.
echo [2/3] Building for production...
set NODE_ENV=production
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Starting production servers...
cd ..
call start-production.bat

echo.
echo ========================================
echo ✅ Simple build completed!
echo ========================================
