-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_plan_id INT DEFAULT 0,
  production_date DATE NOT NULL,
  job_code VARCHAR(100) NOT NULL,
  job_name VARCHAR(255) NOT NULL,
  input_material_quantity DECIMAL(10,2) DEFAULT 0,
  input_material_unit VARCHAR(50) DEFAULT '',
  output_quantity DECIMAL(10,2) DEFAULT 0,
  output_unit VARCHAR(50) DEFAULT '',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_production_date (production_date),
  INDEX idx_job_code (job_code),
  INDEX idx_work_plan_id (work_plan_id)
);

-- Insert sample data
INSERT INTO logs (work_plan_id, production_date, job_code, job_name, input_material_quantity, input_material_unit, output_quantity, output_unit, notes) VALUES
(1, '2024-01-08', 'JOB-001', 'Oyakodon (คัดไก่)', 10.5, 'kg', 50, 'ชิ้น', 'ใช้เวลานานกว่าปกติเนื่องจากต้องเตรียมวัตถุดิบเพิ่มเติม'),
(2, '2024-01-08', 'JOB-002', 'ลูกรอก', 15.0, 'kg', 80, 'ชิ้น', 'ทำอาหารได้ตามแผน'),
(3, '2024-01-08', 'JOB-003', 'ลาบหมูนึ่ง 6 ชิ้น(40 กรัม: ชิ้น)', 8.0, 'kg', 30, 'ชิ้น', 'กำลังปรุงอาหาร'),
(4, '2024-01-09', 'JOB-004', 'ปลาช่อนทอด', 12.0, 'kg', 60, 'ชิ้น', 'วัตถุดิบสดใหม่'),
(5, '2024-01-09', 'JOB-005', 'แกงเขียวหวานไก่', 20.0, 'kg', 100, 'ชิ้น', 'รสชาติเข้มข้น');
