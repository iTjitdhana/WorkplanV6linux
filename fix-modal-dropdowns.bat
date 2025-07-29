@echo off
REM 🎯 Fix Modal Dropdowns
REM สำหรับแก้ไขปัญหา dropdown ใน Modal Edit Draft

echo.
echo ================================
echo Fix Modal Dropdowns
echo ================================
echo.

echo [INFO] Fixing dropdowns in Modal Edit Draft...
echo.

REM Step 1: Create backend environment
echo [STEP 1] Create Backend Environment
echo ================================
echo [INFO] Creating backend/.env file...

(
echo # Database Configuration
echo DB_HOST=192.168.0.94
echo DB_USER=jitdhana
echo DB_PASSWORD=iT12345$
echo DB_NAME=esp_tracker
echo DB_PORT=3306
echo.
echo # Server Configuration
echo PORT=3101
echo NODE_ENV=production
echo.
echo # Frontend Configuration
echo FRONTEND_URL=http://192.168.0.94:3011
echo.
echo # API Configuration
echo API_RATE_LIMIT=1000
echo.
echo # CORS Configuration
echo CORS_ORIGIN=http://192.168.0.94:3011
echo ALLOWED_ORIGINS=http://localhost:3011,http://127.0.0.1:3011,http://192.168.0.94:3011
echo.
echo # Security Configuration
echo JWT_SECRET=your_jwt_secret_key_here
echo SESSION_SECRET=your_session_secret_here
) > backend\.env

echo [SUCCESS] Backend environment created
echo.

REM Step 2: Create frontend environment
echo [STEP 2] Create Frontend Environment
echo ================================
echo [INFO] Creating frontend/.env.local file...

(
echo # Frontend Environment Variables
echo NEXT_PUBLIC_API_URL=http://192.168.0.94:3101
) > frontend\.env.local

echo [SUCCESS] Frontend environment created
echo.

REM Step 3: Test API connection
echo [STEP 3] Test API Connection
echo ================================
echo [INFO] Testing API connection...

curl -s http://192.168.0.94:3101/api/users >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] API not accessible at 192.168.0.94:3101
    echo [INFO] Trying localhost...
    curl -s http://localhost:3101/api/users >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] API not accessible at localhost:3101
        echo [INFO] Please start backend server first
    ) else (
        echo [SUCCESS] API accessible at localhost:3101
        echo [INFO] Updating frontend environment...
        (
        echo # Frontend Environment Variables
        echo NEXT_PUBLIC_API_URL=http://localhost:3101
        ) > frontend\.env.local
    )
) else (
    echo [SUCCESS] API accessible at 192.168.0.94:3101
)
echo.

REM Step 4: Create debug script
echo [STEP 4] Create Debug Script
echo ================================
echo [INFO] Creating debug script...

(
echo @echo off
echo REM 🔍 Modal Dropdown Debug
echo echo.
echo echo ================================
echo echo Modal Dropdown Debug
echo echo ================================
echo echo.
echo echo [INFO] Debugging modal dropdowns...
echo echo.
echo echo [STEP 1] Check environment variables...
echo echo Backend DB_HOST: %%DB_HOST%%
echo echo Frontend API URL: %%NEXT_PUBLIC_API_URL%%
echo echo.
echo echo [STEP 2] Test API endpoints...
echo curl -s http://192.168.0.94:3101/api/users
echo curl -s http://localhost:3101/api/users
echo echo.
echo echo [STEP 3] Check browser console...
echo echo [INFO] Open browser and check console for:
echo echo - API errors
echo echo - JavaScript errors
echo echo - Network requests
echo echo.
echo echo [STEP 4] Test dropdown data...
echo echo [INFO] In browser console, run:
echo echo fetch^('http://192.168.0.94:3101/api/users'^)
echo echo   .then^(res =^> res.json^(^)^)
echo echo   .then^(data =^> console.log^('Users:', data^)^)
echo echo   .catch^(err =^> console.error^('Error:', err^)^^);
echo echo.
echo echo [STEP 5] Check dropdown state...
echo echo [INFO] In browser console, run:
echo echo console.log^('Users state:', users^);
echo echo console.log^('Time options:', timeOptions^);
echo echo.
echo pause
) > debug-modal-dropdowns.bat

echo [SUCCESS] Debug script created: debug-modal-dropdowns.bat
echo.

REM Step 5: Create fix script
echo [STEP 5] Create Fix Script
echo ================================
echo [INFO] Creating fix script...

(
echo @echo off
echo REM 🛠️ Modal Dropdown Fix
echo echo.
echo echo ================================
echo echo Modal Dropdown Fix
echo echo ================================
echo echo.
echo echo [INFO] Fixing modal dropdowns...
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
echo echo [STEP 2] Restart backend...
echo cd backend
echo start "Backend Server" cmd /k "npm start"
echo cd ..
echo echo.
echo echo [STEP 3] Restart frontend...
echo timeout /t 3 ^>nul
echo cd frontend
echo start "Frontend Server" cmd /k "npm run dev"
echo cd ..
echo echo.
echo echo [STEP 4] Test in browser...
echo echo [INFO] Open http://192.168.0.94:3011 or http://localhost:3011
echo echo [INFO] Open Modal Edit Draft
echo echo [INFO] Check dropdowns:
echo echo - Users dropdown
echo echo - Time start dropdown
echo echo - Time end dropdown
echo echo.
echo pause
) > fix-modal-dropdowns.bat

echo [SUCCESS] Fix script created: fix-modal-dropdowns.bat
echo.

REM Step 6: Create test script
echo [STEP 6] Create Test Script
echo ================================
echo [INFO] Creating test script...

(
echo @echo off
echo REM 🧪 Modal Dropdown Test
echo echo.
echo echo ================================
echo echo Modal Dropdown Test
echo echo ================================
echo echo.
echo echo [INFO] Testing modal dropdowns...
echo echo.
echo echo [STEP 1] Test API responses...
echo curl -s http://192.168.0.94:3101/api/users ^| findstr "data"
echo curl -s http://localhost:3101/api/users ^| findstr "data"
echo echo.
echo echo [STEP 2] Test frontend build...
echo cd frontend
echo call npm run build
echo cd ..
echo echo.
echo echo [STEP 3] Start test servers...
echo cd backend
echo start "Backend Test" cmd /k "npm start"
echo cd ..
echo timeout /t 3 ^>nul
echo cd frontend
echo start "Frontend Test" cmd /k "npm run dev"
echo cd ..
echo echo.
echo echo [INFO] Test steps:
echo echo 1. Open http://192.168.0.94:3011 or http://localhost:3011
echo echo 2. Click Edit Draft
echo echo 3. Check all dropdowns:
echo echo    - Users dropdown ^(4 positions^)
echo echo    - Time start dropdown
echo echo    - Time end dropdown
echo echo 4. Check browser console
echo echo.
echo pause
) > test-modal-dropdowns.bat

echo [SUCCESS] Test script created: test-modal-dropdowns.bat
echo.

echo ================================
echo ✅ Modal Dropdown Fix Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Run: debug-modal-dropdowns.bat
echo 2. Run: fix-modal-dropdowns.bat
echo 3. Run: test-modal-dropdowns.bat
echo 4. Check browser console for errors
echo.
echo [TROUBLESHOOTING]
echo If dropdowns still don't work:
echo 1. Check if backend is running
echo 2. Check if API returns data
echo 3. Check browser console for errors
echo 4. Check if environment variables are loaded
echo 5. Try clearing browser cache
echo.
pause 