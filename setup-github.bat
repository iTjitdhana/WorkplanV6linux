@echo off
chcp 65001 >nul
echo 🚀 Setting up WorkplanV6 from GitHub...
echo ================================================

echo 📋 Checking prerequisites...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%

echo.
echo 📦 Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed successfully

echo.
echo 📦 Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully

REM Return to root directory
cd ..

echo.
echo 🔧 Creating Environment Files...

REM Create Backend .env file
echo NODE_ENV=production > backend\.env
echo DB_HOST=192.168.0.94 >> backend\.env
echo DB_USER=jitdhana >> backend\.env
echo DB_PASSWORD=iT12345$ >> backend\.env
echo DB_NAME=esp_tracker >> backend\.env
echo DB_PORT=3306 >> backend\.env
echo PORT=3101 >> backend\.env
echo ✅ Backend .env file created

REM Create Frontend .env.local file
echo NEXT_PUBLIC_API_URL=http://localhost:3101/api > frontend\.env.local
echo ✅ Frontend .env.local file created

echo.
echo 📋 Database Setup Instructions:
echo 1. Create MySQL database: CREATE DATABASE esp_tracker;
echo 2. Import schema: mysql -u root -p esp_tracker -e "source backend/esp_tracker.sql"
echo 3. Update database credentials in backend/.env if needed

echo.
echo 🚀 Quick Start Commands:
echo 1. Start Backend: cd backend ^&^& npm start
echo 2. Start Frontend: cd frontend ^&^& npm run dev
echo 3. Or use: quick-start-simple.bat

echo.
echo 🌐 Access URLs:
echo - Frontend: http://localhost:3011
echo - Backend API: http://localhost:3101/api

echo.
echo ✅ Setup completed successfully!
echo 🎉 WorkplanV6 is ready to use!

echo.
set /p response="❓ Do you want to start the servers now? (y/n): "

if /i "%response%"=="y" (
    echo.
    echo 🚀 Starting servers...
    
    REM Start Backend
    echo Starting Backend...
    start "Backend Server" cmd /k "cd backend && npm start"
    
    REM Wait a moment
    timeout /t 3 /nobreak >nul
    
    REM Start Frontend
    echo Starting Frontend...
    start "Frontend Server" cmd /k "cd frontend && npm run dev"
    
    echo.
    echo ✅ Servers started!
    echo 🌐 Frontend: http://localhost:3011
    echo 🔧 Backend: http://localhost:3101
) else (
    echo.
    echo 📝 You can start the servers manually later using:
    echo    quick-start-simple.bat
)

echo.
echo 🎯 Setup complete! Happy coding! 🚀
pause 