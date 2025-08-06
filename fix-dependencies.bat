@echo off
chcp 65001 >nul
echo Fixing Dependencies
echo ===================

echo Step 1: Cleaning npm cache...
call npm cache clean --force
echo ✅ Cache cleaned

echo.
echo Step 2: Removing node_modules...
if exist "frontend\node_modules" (
    rmdir /s /q "frontend\node_modules"
    echo ✅ Frontend node_modules removed
)
if exist "backend\node_modules" (
    rmdir /s /q "backend\node_modules"
    echo ✅ Backend node_modules removed
)

echo.
echo Step 3: Installing Frontend dependencies with legacy peer deps...
cd frontend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

echo.
echo Step 4: Installing Backend dependencies with legacy peer deps...
cd ..\backend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed

cd ..
echo.
echo 🎉 Dependencies fixed successfully!
echo Ready to build and deploy

pause 