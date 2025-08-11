@echo off
echo ========================================
echo    Fix Dropdown Timing
========================================
echo.

echo Testing frontend build...
cd frontend
npm run build

if errorlevel 1 (
    echo.
    echo ERROR: Frontend build failed!
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Frontend Build Success!
========================================
echo.
echo Dropdown timing fixes applied:
echo - Show dropdown immediately when typing
echo - Removed debouncedValue.length >= 2 condition
echo - Improved input change handling
echo - Better focus behavior
echo.
echo Now test the application:
echo 1. Start the application
echo 2. Go to Production Planning
echo 3. Type in job search field
echo 4. Check if dropdown appears immediately when typing
echo 5. Check if "เพิ่มรายการใหม่" button appears when no results
echo.
pause
