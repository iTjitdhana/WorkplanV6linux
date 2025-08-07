@echo off
echo ========================================
echo    Fix SearchBox Add New Feature
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
echo - Fixed showAddNew condition
echo - Improved dropdown focus handling
echo - Enhanced add new button visibility
echo.
echo Now test the application:
echo 1. Start the application
echo 2. Go to Production Planning
echo 3. Type in job search field
echo 4. Check if "เพิ่มรายการใหม่" button appears
echo.
pause
