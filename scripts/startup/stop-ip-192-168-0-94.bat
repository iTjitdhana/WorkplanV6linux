@echo off
echo 🛑 Stopping system running on IP 192.168.0.94
echo ==========================================

echo.
echo 🔍 Finding Node.js processes...

echo 🔄 Stopping backend server (port 3101)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3101') do (
    echo Found process %%a on port 3101
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! == 0 (
        echo ✅ Backend server stopped
    ) else (
        echo ❌ Could not stop backend server
    )
)

echo.
echo 🔄 Stopping frontend server (port 3011)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3011') do (
    echo Found process %%a on port 3011
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! == 0 (
        echo ✅ Frontend server stopped
    ) else (
        echo ❌ Could not stop frontend server
    )
)

echo.
echo 🔄 Stopping all Node.js processes...
taskkill /IM node.exe /F >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ All Node.js processes stopped
) else (
    echo ℹ️  No Node.js processes found
)

echo.
echo ✅ System shutdown complete
echo.
pause