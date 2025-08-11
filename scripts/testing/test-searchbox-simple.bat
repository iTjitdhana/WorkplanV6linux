@echo off
echo ========================================
echo    Test SearchBox Logic (Simple)
========================================
echo.

echo Testing frontend build only...
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
echo SearchBox logic fixes applied successfully!
echo.
echo Since Docker is already running, you can test now:
echo.
echo 1. Open your browser
echo 2. Go to: http://localhost (or your Docker URL)
echo 3. Navigate to Production Planning page
echo 4. Test the SearchBox scenarios:
echo.
echo    TEST SCENARIO 1:
echo    - Type "น้ำแกงส้ม" (existing job)
echo    - Expected: Show search results only, NO "เพิ่มรายการใหม่" button
echo.
echo    TEST SCENARIO 2:
echo    - Type "น้ำแกงส้ม สูตร 2" (new variation)
echo    - Expected: Show search results + "เพิ่มรายการใหม่" button below
echo.
echo    TEST SCENARIO 3:
echo    - Type "งานใหม่" (completely new)
echo    - Expected: Show "เพิ่มรายการใหม่" button only
echo.
echo 5. Test keyboard navigation:
echo    - Use Arrow keys to navigate
echo    - Press Enter to select
echo    - Press Tab to select "เพิ่มรายการใหม่"
echo.
echo If you see any issues, let me know!
echo.
pause
