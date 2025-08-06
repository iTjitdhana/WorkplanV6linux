@echo off
echo ========================================
echo Setting up and Testing Full System
echo ========================================
echo.

echo 📋 System Architecture:
echo    🗄️  Database: 192.168.0.94 (MySQL) - Local
echo    🔌 Backend: 192.168.0.94 (Node.js API) - Port 3101
echo    🌐 Frontend: 192.168.0.94 (Next.js) - Port 3011
echo.

echo 🔧 Step 1: Setting up Windows Firewall...
echo.

echo ⚠️  Please run setup-firewall-rules.bat as Administrator first
echo    Then press any key to continue...
pause

echo.
echo 🔧 Step 2: Starting Full Server...
echo.

call start-full-server.bat

echo.
echo ⏳ Waiting for servers to start...
timeout /t 10 /nobreak > nul

echo.
echo 🔧 Step 3: Testing Network Access...
echo.

call test-network-access.bat

echo.
echo 🎉 System Setup Complete!
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
echo 💡 Testing from other machines:
echo    1. Open browser on any machine in the network
echo    2. Navigate to: http://192.168.0.94:3011
echo    3. The frontend will automatically connect to backend API
echo    4. Backend will fetch data from local database
echo.
pause 