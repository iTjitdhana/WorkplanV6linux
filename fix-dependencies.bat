@echo off
REM 🔧 Fix Dependencies Script for Windows
REM สำหรับแก้ไขปัญหา dependencies conflicts

echo.
echo ================================
echo Fix Dependencies Issues
echo ================================
echo.

echo [INFO] This script will fix dependency conflicts
echo [INFO] Please run this if you encounter npm install errors
echo.

cd frontend

echo [STEP 1] Clear npm cache
echo [INFO] Clearing npm cache...
call npm cache clean --force

echo.
echo [STEP 2] Remove node_modules and package-lock.json
echo [INFO] Removing existing dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo [STEP 3] Install with legacy peer deps
echo [INFO] Installing with --legacy-peer-deps...
call npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Legacy peer deps failed, trying with --force
    echo [INFO] Installing with --force...
    call npm install --force
    
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Installation failed even with --force
        echo [INFO] Please check your Node.js version and try again
        pause
        exit /b 1
    )
)

echo.
echo [STEP 4] Build the project
echo [INFO] Building the project...
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed
    echo [INFO] Please check the error messages above
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Dependencies fixed successfully!
echo [INFO] You can now run deploy.bat again
echo.

cd ..

pause 