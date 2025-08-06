@echo off
echo ========================================
echo Starting Local Production System
echo ========================================
echo.

echo 📋 System Architecture:
echo    🗄️  Database: 192.168.0.94 (MySQL)
echo    🔌 Backend: 192.168.0.94 (Node.js API)
echo    🌐 Frontend: 192.168.0.161 (Next.js)
echo.

echo 🔧 Step 1: Starting Backend on Database Server...
echo.

echo ⚠️  Please run this on 192.168.0.94 (Database Server):
echo    start-backend-local-db.bat
echo.

echo 🔧 Step 2: Starting Frontend on Client Server...
echo.

echo ⚠️  Please run this on 192.168.0.161 (Client Server):
echo    start-frontend-local-backend.bat
echo.

echo.
echo 📋 Access Information:
echo    🌐 Frontend: http://192.168.0.161:3011
echo    🔌 Backend API: http://192.168.0.94:3101
echo    🗄️  Database: 192.168.0.94:3306 (Local)
echo.
echo 📋 Network Access:
echo    - Any machine can access Frontend via: http://192.168.0.161:3011
echo    - Frontend will connect to Backend at: http://192.168.0.94:3101
echo    - Backend connects to Database locally at: localhost:3306
echo.
pause 