@echo off
echo ========================================
echo Starting Full Server on 192.168.0.94
echo ========================================
echo.

echo 📋 System Architecture:
echo    🗄️  Database: 192.168.0.94 (MySQL) - Local
echo    🔌 Backend: 192.168.0.94 (Node.js API) - Port 3101
echo    🌐 Frontend: 192.168.0.94 (Next.js) - Port 3011
echo.

echo 🔧 Step 1: Starting Backend Server...
echo.

start "Backend Server" cmd /k "start-backend-local-db.bat"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 🔧 Step 2: Starting Frontend Server...
echo.

start "Frontend Server" cmd /k "start-frontend-server.bat"

echo.
echo 🎉 Full server is starting!
echo.
echo 📋 Access Information:
echo    🌐 Frontend: http://192.168.0.94:3011
echo    🔌 Backend API: http://192.168.0.94:3101
echo    🗄️  Database: localhost:3306 (Local)
echo.
echo 📋 Network Access:
echo    - Any machine can access Frontend via: http://192.168.0.94:3011
echo    - Any machine can access Backend API via: http://192.168.0.94:3101
echo    - Backend connects to Database locally at: localhost:3306
echo.
echo ⚠️  Note: Both servers are running in separate windows
echo    Close those windows to stop the servers
echo.
pause 