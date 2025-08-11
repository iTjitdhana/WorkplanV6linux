@echo off
echo ========================================
echo    Test SearchBox Fix
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
echo SearchBox fixes applied:
echo - Fixed API endpoint to /api/new-jobs/search
echo - Improved dropdown visibility logic
echo - Enhanced showAddNew condition
echo - Better focus handling
echo.
echo Now test the application:
echo 1. Start the application
echo 2. Go to Production Planning
echo 3. Type in job search field (at least 2 characters)
echo 4. Check if dropdown appears with search results
echo 5. Check if "เพิ่มรายการใหม่" button appears when no results
echo.
pause
