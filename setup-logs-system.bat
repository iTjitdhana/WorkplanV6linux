@echo off
echo ========================================
echo Setup Logs System
echo ========================================

echo.
echo 1. Installing mysql2 dependency...
cd frontend
npm install mysql2
cd ..

echo.
echo 2. Creating logs table in database...
echo Please run the SQL script manually in your MySQL database:
echo File: create-logs-table.sql
echo.

echo 3. Building frontend...
cd frontend
npm run build
cd ..

echo.
echo 4. Starting development server...
echo Run: npm run dev
echo Or: .\start-performance-simple.bat
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Access the logs page at: http://localhost:3011/logs
echo.
pause
