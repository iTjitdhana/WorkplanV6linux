@echo off
echo ========================================
echo Testing Remote Database Connection
echo ========================================
echo.

echo 🔍 Testing connection to 192.168.0.94:3306...
echo.

cd backend
node test-db-connection.js

echo.
pause 