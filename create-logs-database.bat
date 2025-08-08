@echo off
echo ========================================
echo Create Logs Database Table
echo ========================================

echo.
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
echo -- Insert sample data
echo INSERT INTO logs (work_plan_id, production_date, job_code, job_name, input_material_quantity, input_material_unit, output_quantity, output_unit, notes) VALUES
echo (1, '2024-01-08', 'JOB-001', 'Oyakodon (คัดไก่)', 10.5, 'kg', 50, 'ชิ้น', 'ใช้เวลานานกว่าปกติเนื่องจากต้องเตรียมวัตถุดิบเพิ่มเติม'),
echo (2, '2024-01-08', 'JOB-002', 'ลูกรอก', 15.0, 'kg', 80, 'ชิ้น', 'ทำอาหารได้ตามแผน'),
echo (3, '2024-01-08', 'JOB-003', 'ลาบหมูนึ่ง 6 ชิ้น(40 กรัม: ชิ้น)', 8.0, 'kg', 30, 'ชิ้น', 'กำลังปรุงอาหาร'),
echo (4, '2024-01-09', 'JOB-004', 'ปลาช่อนทอด', 12.0, 'kg', 60, 'ชิ้น', 'วัตถุดิบสดใหม่'),
echo (5, '2024-01-09', 'JOB-005', 'แกงเขียวหวานไก่', 20.0, 'kg', 100, 'ชิ้น', 'รสชาติเข้มข้น');
echo.
echo ========================================
echo Database Setup Instructions
echo ========================================
echo.
echo 1. Open MySQL Workbench or phpMyAdmin
echo 2. Connect to database: esp_tracker_empty
echo 3. Run the SQL commands above
echo 4. After creating the table, restart the frontend server
echo.
echo Access the logs page at: http://localhost:3011/logs
echo.
pause
