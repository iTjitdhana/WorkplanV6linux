@echo off
echo ========================================
echo    Setup Production Logs System
========================================
echo.

echo Setting up production logs system...
echo.

echo 1. Creating database table...
echo Running SQL script to create logs_workplans table...

REM Check if MySQL is running
netstat -an | findstr :3306 >nul
if errorlevel 1 (
    echo ERROR: MySQL is not running!
    echo Please start MySQL service first.
    pause
    exit /b 1
)

REM Run SQL script
mysql -u root -p -e "source create-logs-table.sql"

if errorlevel 1 (
    echo.
    echo ERROR: Failed to create database table!
    echo Please check MySQL connection and permissions.
    echo.
    pause
    exit /b 1
)

echo.
echo 2. Testing backend build...
cd backend
npm run build

if errorlevel 1 (
    echo.
    echo ERROR: Backend build failed!
    echo.
    pause
    exit /b 1
)

echo.
echo 3. Testing frontend build...
cd ../frontend
npm run build

if errorlevel 1 (
    echo.
    echo ERROR: Frontend build failed!
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Setup Complete!
========================================
echo.
echo Production logs system has been set up successfully!
echo.
echo Features included:
echo - Database table: logs_workplans
echo - Backend API endpoints for CRUD operations
echo - Frontend page: /production-logs
echo - Auto-fill feature for material data
echo - Filtering and search capabilities
echo.
echo Next steps:
echo 1. Start your application
echo 2. Navigate to /production-logs
echo 3. Select a date to see work plans
echo 4. Enter production data with auto-fill
echo.
echo The system will automatically:
echo - Load work plans for selected date
echo - Auto-fill material data from previous entries
echo - Save all data in bulk
echo - Prevent duplicate entries
echo.
pause
