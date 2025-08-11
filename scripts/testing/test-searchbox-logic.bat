@echo off
echo ========================================
echo    Test SearchBox Logic Fix
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
echo SearchBox logic fixes applied:
echo - Fixed showAddNew condition to check for exact matches
echo - Show "เพิ่มรายการใหม่" button below search results
echo - Improved keyboard navigation
echo - Better highlight index handling
echo.
echo Now test the application:
echo 1. Start the application
echo 2. Go to Production Planning
echo 3. Test scenarios:
echo    - Type "น้ำแกงส้ม" (existing) - should show results only
echo    - Type "น้ำแกงส้ม สูตร 2" (new) - should show results + add new button
echo    - Type "งานใหม่" (completely new) - should show add new button only
echo.
pause
