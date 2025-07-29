@echo off
REM 🧪 Test Frontend Build
REM สำหรับทดสอบ build frontend

echo.
echo ================================
echo Test Frontend Build
echo ================================
echo.

echo [INFO] Testing frontend build...
echo.

REM Step 1: Check file structure
echo [STEP 1] Check File Structure
echo ================================
echo [INFO] Checking if SearchBox.tsx exists...
if exist "frontend\components\SearchBox.tsx" (
    echo [SUCCESS] SearchBox.tsx found
) else (
    echo [ERROR] SearchBox.tsx not found
    pause
    exit /b 1
)
echo.

REM Step 2: Check import path
echo [STEP 2] Check Import Path
echo ================================
echo [INFO] Current import path in Production_Planing.tsx:
findstr "import.*SearchBox" frontend\Production_Planing.tsx
echo.

REM Step 3: Try different import paths
echo [STEP 3] Try Different Import Paths
echo ================================
echo [INFO] Testing different import paths...

echo [TEST 1] Using relative path: ./components/SearchBox
echo import { SearchBox, SearchOption } from "./components/SearchBox";

echo [TEST 2] Using absolute path: @/components/SearchBox
echo import { SearchBox, SearchOption } from "@/components/SearchBox";

echo [TEST 3] Using simple path: components/SearchBox
echo import { SearchBox, SearchOption } from "components/SearchBox";
echo.

REM Step 4: Clean and rebuild
echo [STEP 4] Clean and Rebuild
echo ================================
cd frontend
echo [INFO] Cleaning previous build...
if exist ".next" (
    rmdir /s /q ".next"
    echo [INFO] Removed .next directory
)
echo.

echo [INFO] Installing dependencies...
call npm install --legacy-peer-deps
echo.

echo [INFO] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    echo [INFO] Please check the errors above
    pause
    exit /b 1
)
echo [SUCCESS] Build completed successfully!
echo.

cd ..
echo ================================
echo ✅ Build Test Completed!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. If build succeeded, run: npm start
echo 2. If build failed, check the error messages
echo 3. Try different import paths if needed
echo.
pause 