@echo off
echo 🔧 Setting up system to run with IP 192.168.0.94
echo =============================================

echo.
echo 📝 Creating backend environment file...
cd backend
(
echo # Production Environment Variables
echo DB_HOST=localhost
echo DB_USER=root
echo DB_PASSWORD=
echo DB_NAME=esp_tracker
echo DB_PORT=3306
echo.
echo # Server Configuration
echo PORT=3101
echo NODE_ENV=production
echo.
echo # Frontend URL for CORS
echo FRONTEND_URL=http://192.168.0.94:3011
echo.
echo # API Rate Limit
echo API_RATE_LIMIT=1000
) > .env

echo ✅ Backend .env created
echo.

echo 📝 Creating frontend environment file...
cd ..\frontend
(
echo # Frontend Environment Variables
echo NEXT_PUBLIC_API_URL=http://192.168.0.94:3101
) > .env.local

echo ✅ Frontend .env.local created
echo.

cd ..

echo 🔧 Backend will run on: http://192.168.0.94:3101
echo 🔧 Frontend will run on: http://192.168.0.94:3011
echo.
echo ⚠️  Important Notes:
echo - Make sure MySQL is running and accessible
echo - Make sure ports 3101 and 3011 are open in firewall
echo - Make sure your network allows access to 192.168.0.94
echo.
echo 🚀 To start the system, run:
echo    start-with-ip-192-168-0-94.bat
echo.
pause