@echo off
REM 🗄️ MySQL Installation Script for Windows
REM สำหรับติดตั้ง MySQL บน Windows Server

echo.
echo ================================
echo MySQL Installation for Windows
echo ================================
echo.

echo [INFO] This script will help you install MySQL on Windows
echo [INFO] Please follow the steps below:
echo.

echo [STEP 1] Download MySQL Installer
echo [INFO] Please download MySQL Installer from:
echo [INFO] https://dev.mysql.com/downloads/installer/
echo [INFO] Choose "mysql-installer-community" for Windows
echo.

echo [STEP 2] Run MySQL Installer
echo [INFO] After downloading, run the installer as Administrator
echo [INFO] Choose "Developer Default" or "Server only" installation
echo [INFO] Set root password when prompted
echo [INFO] Complete the installation
echo.

echo [STEP 3] Add MySQL to PATH
echo [INFO] After installation, add MySQL to your system PATH:
echo [INFO] 1. Open System Properties (Win + R, type: sysdm.cpl)
echo [INFO] 2. Click "Environment Variables"
echo [INFO] 3. Edit "Path" variable
echo [INFO] 4. Add: C:\Program Files\MySQL\MySQL Server 8.0\bin
echo [INFO] 5. Click OK to save
echo.

echo [STEP 4] Test MySQL Installation
echo [INFO] After adding to PATH, test with:
echo [INFO] mysql --version
echo [INFO] mysql -u root -p
echo.

echo [STEP 5] Create Database
echo [INFO] Once MySQL is working, create the database:
echo [INFO] mysql -u root -p
echo [INFO] CREATE DATABASE esp_tracker;
echo [INFO] exit
echo.

echo [STEP 6] Import Database Schema
echo [INFO] Import the database schema:
echo [INFO] mysql -u root -p esp_tracker ^< backend/esp_tracker ^(6^).sql
echo.

echo [INFO] After completing these steps, run deploy.bat again
echo [INFO] The system will be able to connect to MySQL
echo.

pause 