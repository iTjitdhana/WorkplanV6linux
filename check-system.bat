@echo off
REM 🔍 System Check Script
REM สำหรับตรวจสอบสถานะระบบและแก้ไขปัญหา

echo.
echo ================================
echo System Check - WorkplanV5
echo ================================
echo.

echo [INFO] Checking system status and troubleshooting issues...
echo.

REM Step 1: Check Node.js
echo [STEP 1] Checking Node.js
echo ================================
node --version
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo [SOLUTION] Install Node.js from: https://nodejs.org/
    echo [INFO] Download and install Node.js LTS version
    pause
    exit /b 1
)
echo [SUCCESS] Node.js is installed
echo.

REM Step 2: Check npm
echo [STEP 2] Checking npm
echo ================================
npm --version
if %errorlevel% neq 0 (
    echo [ERROR] npm is not working
    echo [SOLUTION] Reinstall Node.js
    pause
    exit /b 1
)
echo [SUCCESS] npm is working
echo.

REM Step 3: Check MySQL
echo [STEP 3] Checking MySQL
echo ================================
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MySQL is not installed or not in PATH
    echo [SOLUTION] Install MySQL or use SQLite
    echo [INFO] You can continue without MySQL for testing
) else (
    echo [SUCCESS] MySQL is installed
    mysql --version
)
echo.

REM Step 4: Check Ports
echo [STEP 4] Checking Port Availability
echo ================================
echo [INFO] Checking if ports 3011 and 3101 are available...

netstat -an | findstr ":3011" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 3011 is already in use
    echo [SOLUTION] Stop the service using port 3011
) else (
    echo [SUCCESS] Port 3011 is available
)

netstat -an | findstr ":3101" >nul
if %errorlevel% equ 0 (
    echo [WARNING] Port 3101 is already in use
    echo [SOLUTION] Stop the service using port 3101
) else (
    echo [SUCCESS] Port 3101 is available
)
echo.

REM Step 5: Check Project Structure
echo [STEP 5] Checking Project Structure
echo ================================
if not exist "backend" (
    echo [ERROR] Backend folder not found
    echo [SOLUTION] Make sure you're in the correct directory
    pause
    exit /b 1
)
echo [SUCCESS] Backend folder exists

if not exist "frontend" (
    echo [ERROR] Frontend folder not found
    echo [SOLUTION] Make sure you're in the correct directory
    pause
    exit /b 1
)
echo [SUCCESS] Frontend folder exists
echo.

REM Step 6: Check Dependencies
echo [STEP 6] Checking Dependencies
echo ================================
if not exist "backend\node_modules" (
    echo [WARNING] Backend dependencies not installed
    echo [SOLUTION] Run: cd backend && npm install
) else (
    echo [SUCCESS] Backend dependencies installed
)

if not exist "frontend\node_modules" (
    echo [WARNING] Frontend dependencies not installed
    echo [SOLUTION] Run: cd frontend && npm install --legacy-peer-deps
) else (
    echo [SUCCESS] Frontend dependencies installed
)
echo.

REM Step 7: Check Environment Files
echo [STEP 7] Checking Environment Files
echo ================================
if not exist "backend\.env" (
    echo [WARNING] Backend .env file not found
    echo [SOLUTION] Will be created by quick-start.bat
) else (
    echo [SUCCESS] Backend .env file exists
)

if not exist "frontend\.env.local" (
    echo [WARNING] Frontend .env.local file not found
    echo [SOLUTION] Will be created by quick-start.bat
) else (
    echo [SUCCESS] Frontend .env.local file exists
)
echo.

REM Step 8: Check PM2
echo [STEP 8] Checking PM2
echo ================================
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] PM2 is not installed
    echo [INFO] You can use quick-start.bat instead
) else (
    echo [SUCCESS] PM2 is installed
    pm2 --version
)
echo.

REM Step 9: Recommendations
echo [STEP 9] Recommendations
echo ================================
echo [INFO] Based on the system check:
echo.
echo [IF EVERYTHING IS OK]
echo 1. Run: quick-start.bat
echo 2. Or run: manage-production.bat (if PM2 is installed)
echo.
echo [IF THERE ARE ISSUES]
echo 1. Install missing components
echo 2. Fix port conflicts
echo 3. Install dependencies
echo 4. Try again
echo.
echo [COMMON SOLUTIONS]
echo - Node.js issues: Reinstall Node.js LTS
echo - Port conflicts: Stop other services
echo - MySQL issues: Install MySQL or use SQLite
echo - Dependencies: Run npm install in each folder
echo.

echo ================================
echo ✅ System Check Complete!
echo ================================
echo.
echo [NEXT STEPS]
echo 1. If all checks passed: Run quick-start.bat
echo 2. If issues found: Fix them first
echo 3. For help: Check the troubleshooting guide
echo.
pause 