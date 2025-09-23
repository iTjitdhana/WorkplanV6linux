@echo off
echo ========================================
echo Simple Build with Basic Config
echo ========================================

echo.
echo [1/4] Backup current config...
cd frontend
copy next.config.mjs next.config.backup.mjs

echo.
echo [2/4] Using simple config...
copy next.config.simple.mjs next.config.mjs

echo.
echo [3/4] Building for production...
if exist .next rmdir /s /q .next
set NODE_ENV=production
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    copy next.config.backup.mjs next.config.mjs
    pause
    exit /b 1
)

echo.
echo [4/4] Restoring original config...
copy next.config.backup.mjs next.config.mjs

echo.
echo ========================================
echo ✅ Simple build completed successfully!
echo ========================================
echo You can now run start-production.bat
echo.
pause
