@echo off
echo ========================================
echo    Fix SearchBox Logic (Final)
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
echo - Removed options.length === 0 condition from showAddNew
echo - Show "เพิ่มรายการใหม่" button below search results
echo - Fixed logic to show button when no exact match found
echo.
echo Now test the application:
echo 1. Refresh your browser page
echo 2. Go to Production Planning
echo 3. Test scenarios:
echo    - Type "น้ำแกงส้ม" (existing) - should show results only
echo    - Type "น้ำแกงส้ม สูตร 2" (new) - should show results + add new button
echo    - Type "งานใหม่" (completely new) - should show add new button only
echo.
echo The key change: showAddNew now works even when there are search results
echo as long as there's no exact match for the typed text.
echo.
pause
