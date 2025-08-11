@echo off
REM 🎨 Create Frontend Environment File
REM สำหรับสร้างไฟล์ .env.local ใน frontend

echo.
echo ================================
echo Create Frontend Environment
echo ================================
echo.

echo [INFO] Creating frontend/.env.local file...
echo.

REM Create frontend/.env.local
(
echo # Frontend Environment Variables
echo NEXT_PUBLIC_API_URL=http://localhost:3101
) > frontend\.env.local

echo [SUCCESS] Frontend environment file created: frontend/.env.local
echo.
echo [INFO] Environment variables:
echo - NEXT_PUBLIC_API_URL=http://localhost:3101
echo.

echo [INFO] Next steps:
echo 1. Restart frontend development server
echo 2. Test the application
echo 3. Check if Select components work properly
echo.

pause 