@echo off
echo System Performance Optimization
echo ===============================================
echo.

echo Welcome to System Performance Optimizer
echo.

:menu
echo Select Test:
echo 1. Test API Performance
echo 2. Test Database Performance  
echo 3. Add Database Indexes
echo 4. Run All Tests
echo 5. Exit Program
echo.

set /p choice=Please select (1-5): 

if "%choice%"=="1" goto api_test
if "%choice%"=="2" goto db_test
if "%choice%"=="3" goto add_indexes
if "%choice%"=="4" goto all_tests
if "%choice%"=="5" goto exit
echo Invalid choice. Please select 1-5.
goto menu

:api_test
echo Starting API Performance Test...
powershell -ExecutionPolicy Bypass -File "optimize-system-fixed.ps1"
goto continue

:db_test
echo Starting Database Performance Test...
powershell -ExecutionPolicy Bypass -File "test-db-performance-fixed.ps1"
goto continue

:add_indexes
echo Adding Database Indexes...
echo This will execute SQL commands to add indexes to improve performance.
echo.
pause
echo Executing SQL file...
mysql -u root -p < optimize-database-indexes.sql
echo Database indexes added.
goto continue

:all_tests
echo Running All Tests...
echo.
echo 1. API Performance Test
powershell -ExecutionPolicy Bypass -File "optimize-system-fixed.ps1"
echo.
pause
echo.
echo 2. Database Performance Test
powershell -ExecutionPolicy Bypass -File "test-db-performance-fixed.ps1"
echo.
pause
echo.
echo 3. Adding Database Indexes
mysql -u root -p < optimize-database-indexes.sql
echo.
echo 4. Testing again after adding indexes
powershell -ExecutionPolicy Bypass -File "test-db-performance-fixed.ps1"
echo.
echo All tests completed.
goto continue

:continue
echo.
pause
goto menu

:exit
echo Thank you for using System Performance Optimizer
pause