@echo off
echo ========================================
echo Install Logs System
echo ========================================

echo.
echo 1. Installing mysql2 dependency...
cd frontend
npm install mysql2
cd ..

echo.
echo 2. Creating logs table in database...
echo Please run this SQL command in your MySQL database:
echo.
echo USE esp_tracker_empty;
echo.
echo CREATE TABLE IF NOT EXISTS logs (
echo   id INT AUTO_INCREMENT PRIMARY KEY,
echo   work_plan_id INT DEFAULT 0,
echo   production_date DATE NOT NULL,
echo   job_code VARCHAR(100) NOT NULL,
echo   job_name VARCHAR(255) NOT NULL,
echo   input_material_quantity DECIMAL(10,2) DEFAULT 0,
echo   input_material_unit VARCHAR(50) DEFAULT '',
echo   output_quantity DECIMAL(10,2) DEFAULT 0,
echo   output_unit VARCHAR(50) DEFAULT '',
echo   notes TEXT,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
echo   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
echo   INDEX idx_production_date (production_date),
echo   INDEX idx_job_code (job_code),
echo   INDEX idx_work_plan_id (work_plan_id)
echo );
echo.

echo 3. Building frontend...
cd frontend
npm run build
cd ..

echo.
echo 4. Starting system...
echo Choose your option:
echo 1. Start with Docker (recommended)
echo 2. Start with npm (development)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
  echo Starting with Docker...
  call fix-port-conflict.bat
) else if "%choice%"=="2" (
  echo Starting with npm...
  cd frontend
  npm run dev
) else (
  echo Invalid choice. Please run the script again.
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Access the logs page at: http://localhost:3011/logs
echo.
pause
