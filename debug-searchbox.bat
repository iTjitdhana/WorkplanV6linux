@echo off
echo ========================================
echo    Debug SearchBox Logic
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
echo SearchBox debug fixes applied:
echo - Added condition: (options.length === 0 || value.trim().length > 2)
echo - This ensures "เพิ่มรายการใหม่" shows when:
echo   1. No search results found, OR
echo   2. User types more than 2 characters
echo.
echo Now test the application:
echo 1. Refresh your browser page (Ctrl+F5)
echo 2. Go to Production Planning
echo 3. Test scenarios:
echo.
echo    TEST 1: Type "น้ำแกงส้ม" (existing)
echo    - Expected: Show results only, NO add button
echo.
echo    TEST 2: Type "น้ำแกงส้ม สูตร 2" (new variation)
echo    - Expected: Show results + "เพิ่มรายการใหม่" button
echo    - Because: "น้ำแกงส้ม สูตร 2" has more than 2 chars and no exact match
echo.
echo    TEST 3: Type "งานใหม่" (completely new)
echo    - Expected: Show "เพิ่มรายการใหม่" button only
echo.
echo If it still doesn't work, we may need to add console.log debugging.
echo.
pause
