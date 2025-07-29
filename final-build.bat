@echo off
REM 🚀 Final Frontend Build
REM สำหรับ build frontend สุดท้าย

echo.
echo ================================
echo Final Frontend Build
echo ================================
echo.

echo [INFO] Building frontend with direct import...
echo.

REM Step 1: Check files
echo [STEP 1] Check Files
echo ================================
echo [INFO] Checking SearchBox files...

if exist "frontend\components\SearchBox.tsx" (
    echo [SUCCESS] SearchBox.tsx found
) else (
    echo [ERROR] SearchBox.tsx not found
    pause
    exit /b 1
)

echo.

REM Step 2: Check import
echo [STEP 2] Check Import
echo ================================
echo [INFO] Current import in Production_Planing.tsx:
findstr "import.*SearchBox" frontend\Production_Planing.tsx
echo.

REM Step 3: Clean and build
echo [STEP 3] Clean and Build
echo ================================
cd frontend

echo [INFO] Cleaning previous build...
if exist ".next" (
    rmdir /s /q ".next"
    echo [SUCCESS] Cleaned previous build
)

echo [INFO] Installing dependencies...
call npm install --legacy-peer-deps

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

REM Step 4: Start server
echo [STEP 4] Start Production Server
echo ================================
echo [INFO] Starting production server...
echo [INFO] Frontend will be available at:
echo - Local: http://localhost:3011
echo - Network: http://192.168.0.94:3011
echo.
echo [INFO] Press Ctrl+C to stop the server
echo.
call npm start 