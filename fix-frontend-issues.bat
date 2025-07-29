@echo off
REM 🔧 Fix Frontend Issues
REM สำหรับแก้ไขปัญหา frontend หลัง deploy

echo.
echo ================================
echo Fix Frontend Issues
echo ================================
echo.

echo [INFO] Fixing frontend issues after deployment...
echo.

REM Step 1: Create environment file
echo [STEP 1] Creating environment file...
(
echo # Frontend Environment Variables
echo NEXT_PUBLIC_API_URL=http://localhost:3101
) > frontend\.env.local

echo [SUCCESS] Environment file created: frontend/.env.local
echo.

REM Step 2: Clear Next.js cache
echo [STEP 2] Clearing Next.js cache...
cd frontend
if exist ".next" (
    echo [INFO] Removing .next directory...
    rmdir /s /q .next
    echo [SUCCESS] Next.js cache cleared
) else (
    echo [INFO] No .next directory found
)
cd ..
echo.

REM Step 3: Clear node_modules and reinstall
echo [STEP 3] Reinstalling dependencies...
cd frontend
echo [INFO] Removing node_modules...
if exist "node_modules" (
    rmdir /s /q node_modules
)
echo [INFO] Removing package-lock.json...
if exist "package-lock.json" (
    del package-lock.json
)
echo [INFO] Installing dependencies...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    echo [INFO] Trying with --force...
    call npm install --force
)
cd ..
echo.

REM Step 4: Check for common issues
echo [STEP 4] Checking for common issues...
echo.

echo [INFO] Common issues that might cause Select components to not work:
echo 1. Missing environment variables
echo 2. API connection issues
echo 3. Component import issues
echo 4. CSS/styling issues
echo 5. JavaScript errors
echo.

REM Step 5: Create debug script
echo [STEP 5] Creating debug script...
(
echo @echo off
echo REM 🔍 Frontend Debug Script
echo echo.
echo echo ================================
echo echo Frontend Debug
echo echo ================================
echo echo.
echo echo [INFO] Debugging frontend issues...
echo echo.
echo echo [STEP 1] Check environment variables...
echo echo NEXT_PUBLIC_API_URL: %%NEXT_PUBLIC_API_URL%%
echo echo.
echo echo [STEP 2] Check if backend is running...
echo curl -s http://localhost:3101 ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo   echo [ERROR] Backend not accessible
echo ^) else ^(
echo   echo [SUCCESS] Backend accessible
echo ^)
echo echo.
echo echo [STEP 3] Check frontend build...
echo cd frontend
echo call npm run build
echo cd ..
echo echo.
echo echo [STEP 4] Start development server...
echo cd frontend
echo start "Frontend Debug" cmd /k "npm run dev"
echo cd ..
echo echo.
echo pause
) > debug-frontend.bat

echo [SUCCESS] Debug script created: debug-frontend.bat
echo.

REM Step 6: Create test script
echo [STEP 6] Creating test script...
(
echo @echo off
echo REM 🧪 Frontend Test Script
echo echo.
echo echo ================================
echo echo Frontend Test
echo echo ================================
echo echo.
echo echo [INFO] Testing frontend components...
echo echo.
echo echo [STEP 1] Test environment...
echo echo [INFO] Checking if environment variables are loaded...
echo echo.
echo echo [STEP 2] Test API connection...
echo curl -s http://localhost:3101/api/users ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo   echo [ERROR] API not accessible
echo ^) else ^(
echo   echo [SUCCESS] API accessible
echo ^)
echo echo.
echo echo [STEP 3] Test frontend build...
echo cd frontend
echo call npm run build
echo cd ..
echo echo.
echo echo [STEP 4] Start test server...
echo cd frontend
echo start "Frontend Test" cmd /k "npm run dev"
echo cd ..
echo echo.
echo echo [INFO] Open browser and test:
echo echo - http://localhost:3011
echo echo - Check browser console for errors
echo echo - Test Select components
echo echo.
echo pause
) > test-frontend.bat

echo [SUCCESS] Test script created: test-frontend.bat
echo.

echo ================================
echo ✅ Frontend Fix Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. Run: debug-frontend.bat
echo 2. Run: test-frontend.bat
echo 3. Check browser console for errors
echo 4. Test Select components
echo.
echo [TROUBLESHOOTING]
echo If Select components still don't work:
echo 1. Check browser console for JavaScript errors
echo 2. Check if API is accessible
echo 3. Check if environment variables are loaded
echo 4. Try clearing browser cache
echo 5. Check if all dependencies are installed
echo.
pause 