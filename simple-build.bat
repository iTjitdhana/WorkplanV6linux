@echo off
REM 🚀 Simple Frontend Build
REM สำหรับ build frontend แบบง่ายๆ

echo.
echo ================================
echo Simple Frontend Build
echo ================================
echo.

echo [INFO] Building frontend...
echo.

REM Check current directory
echo [STEP 1] Check Current Directory
echo ================================
echo [INFO] Current directory: %CD%
echo.

REM Check if we're in the right place
if exist "frontend" (
    echo [INFO] Found frontend directory
    cd frontend
) else (
    echo [ERROR] frontend directory not found
    echo [INFO] Please run this script from the project root
    pause
    exit /b 1
)

echo [INFO] Now in: %CD%
echo.

REM Clean previous build
echo [STEP 2] Clean Previous Build
echo ================================
if exist ".next" (
    echo [INFO] Removing .next directory...
    rmdir /s /q ".next"
    echo [SUCCESS] Cleaned previous build
) else (
    echo [INFO] No previous build found
)
echo.

REM Install dependencies
echo [STEP 3] Install Dependencies
echo ================================
echo [INFO] Installing dependencies...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    echo [INFO] Trying with --force...
    call npm install --force
)
echo [SUCCESS] Dependencies installed
echo.

REM Build
echo [STEP 4] Build Frontend
echo ================================
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

REM Start production server
echo [STEP 5] Start Production Server
echo ================================
echo [INFO] Starting production server...
echo [INFO] Frontend will be available at:
echo - Local: http://localhost:3011
echo - Network: http://192.168.0.94:3011
echo.
echo [INFO] Press Ctrl+C to stop the server
echo.
call npm start 