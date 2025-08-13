@echo off
echo ========================================
echo Building Frontend for Production
echo ========================================

echo.
echo [1/2] Installing dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Building for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Frontend build completed successfully!
echo ========================================
echo You can now run start-production.bat
echo.
pause
