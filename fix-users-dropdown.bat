@echo off
REM 👥 Fix Users Dropdown
REM สำหรับแก้ไขปัญหา users dropdown ใน Modal Edit Draft

echo.
echo ================================
echo Fix Users Dropdown
echo ================================
echo.

echo [INFO] Fixing users dropdown in Modal Edit Draft...
echo.

REM Step 1: Check environment variables
echo [STEP 1] Check Environment Variables
echo ================================
echo [INFO] Checking environment variables...

if "%NEXT_PUBLIC_API_URL%"=="" (
    echo [ERROR] NEXT_PUBLIC_API_URL not set
    echo [INFO] Creating environment file...
    (
    echo # Frontend Environment Variables
    echo NEXT_PUBLIC_API_URL=http://localhost:3101
    ) > frontend\.env.local
    echo [SUCCESS] Environment file created
) else (
    echo [SUCCESS] NEXT_PUBLIC_API_URL is set: %NEXT_PUBLIC_API_URL%
)
echo.

REM Step 2: Test API connection
echo [STEP 2] Test API Connection
echo ================================
echo [INFO] Testing API connection...

curl -s http://localhost:3101/api/users >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] API not accessible
    echo [INFO] Please start backend server first
    echo [SOLUTION] Run: cd backend ^&^& npm start
    goto :start_backend
) else (
    echo [SUCCESS] API is accessible
)
echo.

REM Step 3: Test users endpoint
echo [STEP 3] Test Users Endpoint
echo ================================
echo [INFO] Testing users endpoint...

curl -s http://localhost:3101/api/users
if %errorlevel% neq 0 (
    echo [ERROR] Users endpoint failed
    echo [INFO] Checking backend logs...
) else (
    echo [SUCCESS] Users endpoint working
)
echo.

REM Step 4: Create debug script
echo [STEP 4] Create Debug Script
echo ================================
echo [INFO] Creating debug script...

(
echo @echo off
echo REM 🔍 Users Dropdown Debug
echo echo.
echo echo ================================
echo echo Users Dropdown Debug
echo echo ================================
echo echo.
echo echo [INFO] Debugging users dropdown...
echo echo.
echo echo [STEP 1] Check environment variables...
echo echo NEXT_PUBLIC_API_URL: %%NEXT_PUBLIC_API_URL%%
echo echo.
echo echo [STEP 2] Test API connection...
echo curl -s http://localhost:3101/api/users
echo echo.
echo echo [STEP 3] Check browser console...
echo echo [INFO] Open browser and check console for:
echo echo - API errors
echo echo - JavaScript errors
echo echo - Network requests
echo echo.
echo echo [STEP 4] Test users data...
echo echo [INFO] In browser console, run:
echo echo fetch^('http://localhost:3101/api/users'^)
echo echo   .then^(res =^> res.json^(^)^)
echo echo   .then^(data =^> console.log^('Users:', data^)^)
echo echo   .catch^(err =^> console.error^('Error:', err^)^^);
echo echo.
echo echo [STEP 5] Check users state...
echo echo [INFO] In browser console, run:
echo echo console.log^('Users state:', users^);
echo echo.
echo pause
) > debug-users-dropdown.bat

echo [SUCCESS] Debug script created: debug-users-dropdown.bat
echo.

REM Step 5: Create fix script
echo [STEP 5] Create Fix Script
echo ================================
echo [INFO] Creating fix script...

(
echo @echo off
echo REM 🛠️ Users Dropdown Fix
echo echo.
echo echo ================================
echo echo Users Dropdown Fix
echo echo ================================
echo echo.
echo echo [INFO] Fixing users dropdown...
echo echo.
echo echo [STEP 1] Clear Next.js cache...
echo cd frontend
echo if exist ".next" ^(
echo   echo [INFO] Removing .next directory...
echo   rmdir /s /q .next
echo   echo [SUCCESS] Next.js cache cleared
echo ^) else ^(
echo   echo [INFO] No .next directory found
echo ^)
echo cd ..
echo echo.
echo echo [STEP 2] Restart frontend...
echo cd frontend
echo start "Frontend Fix" cmd /k "npm run dev"
echo cd ..
echo echo.
echo echo [STEP 3] Test in browser...
echo echo [INFO] Open http://localhost:3011
echo echo [INFO] Open Modal Edit Draft
echo echo [INFO] Check users dropdown
echo echo.
echo pause
) > fix-users-dropdown.bat

echo [SUCCESS] Fix script created: fix-users-dropdown.bat
echo.

REM Step 6: Create test script
echo [STEP 6] Create Test Script
echo ================================
echo [INFO] Creating test script...

(
echo @echo off
echo REM 🧪 Users Dropdown Test
echo echo.
echo echo ================================
echo echo Users Dropdown Test
echo echo ================================
echo echo.
echo echo [INFO] Testing users dropdown...
echo echo.
echo echo [STEP 1] Test API response...
echo curl -s http://localhost:3101/api/users ^| findstr "data"
echo echo.
echo echo [STEP 2] Test frontend build...
echo cd frontend
echo call npm run build
echo cd ..
echo echo.
echo echo [STEP 3] Start test server...
echo cd frontend
echo start "Users Test" cmd /k "npm run dev"
echo cd ..
echo echo.
echo echo [INFO] Test steps:
echo echo 1. Open http://localhost:3011
echo echo 2. Click Edit Draft
echo echo 3. Check users dropdown
echo echo 4. Check browser console
echo echo.
echo pause
) > test-users-dropdown.bat

echo [SUCCESS] Test script created: test-users-dropdown.bat
echo.

echo ================================
echo ✅ Users Dropdown Fix Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Run: debug-users-dropdown.bat
echo 2. Run: fix-users-dropdown.bat
echo 3. Run: test-users-dropdown.bat
echo 4. Check browser console for errors
echo.
echo [TROUBLESHOOTING]
echo If users dropdown still doesn't work:
echo 1. Check if backend is running
echo 2. Check if API returns users data
echo 3. Check browser console for errors
echo 4. Check if environment variables are loaded
echo 5. Try clearing browser cache
echo.
pause
exit /b 0

:start_backend
echo [INFO] Starting backend server...
cd backend
start "Backend Server" cmd /k "npm start"
cd ..
echo [INFO] Backend server started
echo [INFO] Please wait a moment and try again
pause 