@echo off
REM 🚀 Quick Start Script
REM สำหรับรันระบบแบบง่ายๆ โดยไม่ต้องใช้ PM2

echo.
echo ================================
echo Quick Start - WorkplanV5
echo ================================
echo.

echo [INFO] Starting WorkplanV5 in simple mode...
echo [INFO] This will start backend and frontend directly
echo.

REM Step 1: Check Node.js
echo [STEP 1] Checking Node.js Installation
echo ================================
node --version
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo [INFO] Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo [SUCCESS] Node.js is installed
echo.

REM Step 2: Setup Backend
echo [STEP 2] Setting up Backend
echo ================================
cd backend

echo [INFO] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

echo [INFO] Creating backend environment file...
if not exist .env (
    (
    echo # Backend Environment Variables
    echo DB_HOST=localhost
    echo DB_USER=root
    echo DB_PASSWORD=your_mysql_password
    echo DB_NAME=esp_tracker
    echo DB_PORT=3306
    echo PORT=3101
    echo NODE_ENV=production
    echo FRONTEND_URL=http://localhost:3011
    echo API_RATE_LIMIT=1000
    ) > .env
    echo [INFO] Please edit backend\.env with your MySQL password
)

cd ..
echo [SUCCESS] Backend setup complete
echo.

REM Step 3: Setup Frontend
echo [STEP 3] Setting up Frontend
echo ================================
cd frontend

echo [INFO] Installing frontend dependencies...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    echo [INFO] Trying with --force...
    call npm install --force
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies even with --force
        pause
        exit /b 1
    )
)

echo [INFO] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
)

cd ..
echo [SUCCESS] Frontend setup complete
echo.

REM Step 4: Start Services
echo [STEP 4] Starting Services
echo ================================
echo [INFO] Starting backend server...
start "Backend Server" cmd /k "cd backend && npm start"

echo [INFO] Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo [INFO] Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ================================
echo 🎉 System Started Successfully!
echo ================================
echo.
echo [ACCESS URLs]
echo Backend API: http://localhost:3101
echo Frontend App: http://localhost:3011
echo.
echo [IMPORTANT NOTES]
echo 1. Two command windows will open
echo 2. Keep them open to run the system
echo 3. Close them to stop the system
echo 4. Edit backend\.env with your MySQL password
echo.
echo [TROUBLESHOOTING]
echo If you see errors:
echo 1. Check if MySQL is running
echo 2. Verify MySQL password in backend\.env
echo 3. Make sure ports 3011 and 3101 are free
echo.
echo [NEXT STEPS]
echo 1. Open browser and go to: http://localhost:3011
echo 2. Test the system functionality
echo 3. For network access, run: setup-network-access.bat
echo.
pause 