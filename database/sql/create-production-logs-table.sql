-- สร้างตาราง production_logs สำหรับเก็บข้อมูลการผลิตที่มีรายละเอียดวัตถุดิบ
CREATE TABLE IF NOT EXISTS `production_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_plan_id` int DEFAULT NULL,
  `process_number` int DEFAULT NULL,
  `production_date` date NOT NULL,
  `job_code` varchar(100) NOT NULL,
  `job_name` varchar(255) NOT NULL,
  
  -- ข้อมูลวัตถุดิบเข้า
  `input_material_quantity` DECIMAL(10,2) DEFAULT 0,
  `input_material_unit` VARCHAR(50) DEFAULT '',
  `input_material_name` VARCHAR(255) DEFAULT '',
  
  -- ข้อมูลผลผลิตออก
  `output_quantity` DECIMAL(10,2) DEFAULT 0,
  `output_unit` VARCHAR(50) DEFAULT '',
  `output_product_name` VARCHAR(255) DEFAULT '',
  
  -- คำนวณ Yield %
  `yield_percentage` DECIMAL(5,2) DEFAULT 0,
  
  -- ข้อมูลเพิ่มเติม
  `operator_id` int DEFAULT NULL,
  `operator_name` VARCHAR(100) DEFAULT '',
  `machine_id` int DEFAULT NULL,
  `machine_name` VARCHAR(100) DEFAULT '',
  `production_room_id` int DEFAULT NULL,
  `room_name` VARCHAR(100) DEFAULT '',
  
  -- เวลาเริ่ม-จบ
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration_minutes` int DEFAULT 0,
  
  -- สถานะ
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `notes` TEXT,
  
  -- Timestamps
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_production_date` (`production_date`),
  KEY `idx_job_code` (`job_code`),
  KEY `idx_work_plan_id` (`work_plan_id`),
  KEY `idx_operator_id` (`operator_id`),
  KEY `idx_machine_id` (`machine_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  
  -- Foreign Keys
  CONSTRAINT `fk_production_logs_work_plan` FOREIGN KEY (`work_plan_id`) REFERENCES `work_plans` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_production_logs_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_production_logs_machine` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_production_logs_room` FOREIGN KEY (`production_room_id`) REFERENCES `production_rooms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางบันทึกข้อมูลการผลิตที่มีรายละเอียดวัตถุดิบและ Yield %';

-- สร้าง Trigger สำหรับคำนวณ Yield % อัตโนมัติ
DELIMITER $$
CREATE TRIGGER `calculate_yield_percentage` 
BEFORE INSERT ON `production_logs`
FOR EACH ROW
BEGIN
    -- คำนวณ Yield % = (output_quantity / input_material_quantity) * 100
    IF NEW.input_material_quantity > 0 AND NEW.output_quantity > 0 THEN
        SET NEW.yield_percentage = (NEW.output_quantity / NEW.input_material_quantity) * 100;
    ELSE
        SET NEW.yield_percentage = 0;
    END IF;
    
    -- คำนวณระยะเวลา (นาที)
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
        SET NEW.duration_minutes = TIMESTAMPDIFF(MINUTE, NEW.start_time, NEW.end_time);
    END IF;
END$$

CREATE TRIGGER `update_yield_percentage` 
BEFORE UPDATE ON `production_logs`
FOR EACH ROW
BEGIN
    -- คำนวณ Yield % = (output_quantity / input_material_quantity) * 100
    IF NEW.input_material_quantity > 0 AND NEW.output_quantity > 0 THEN
        SET NEW.yield_percentage = (NEW.output_quantity / NEW.input_material_quantity) * 100;
    ELSE
        SET NEW.yield_percentage = 0;
    END IF;
    
    -- คำนวณระยะเวลา (นาที)
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
        SET NEW.duration_minutes = TIMESTAMPDIFF(MINUTE, NEW.start_time, NEW.end_time);
    END IF;
END$$
DELIMITER ;

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO `production_logs` (
    `work_plan_id`, `process_number`, `production_date`, `job_code`, `job_name`,
    `input_material_quantity`, `input_material_unit`, `input_material_name`,
    `output_quantity`, `output_unit`, `output_product_name`,
    `operator_name`, `machine_name`, `room_name`,
    `start_time`, `end_time`, `status`, `notes`
) VALUES
(1, 1, CURDATE(), 'JOB001', 'ตวงสูตร', 10.5, 'kg', 'แป้งสาลี', 9.8, 'kg', 'แป้งผสม', 'เชฟสมชาย', 'เครื่องผสม', 'ห้องเตรียมวัตถุดิบ', NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, 'completed', 'ผลิตเสร็จตามแผน'),
(1, 2, CURDATE(), 'JOB002', 'นวดแป้ง', 9.8, 'kg', 'แป้งผสม', 9.2, 'kg', 'แป้งนวด', 'เชฟสมชาย', 'เครื่องนวด', 'ห้องผลิตหลัก', NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 30 MINUTE, 'completed', 'นวดเสร็จแล้ว'),
(2, 1, CURDATE(), 'JOB003', 'ปรุงอาหาร', 5.0, 'kg', 'เนื้อไก่', 4.2, 'kg', 'ไก่ปรุงสุก', 'เชฟสมชาย', 'เตาแก๊ส', 'ห้องครัวร้อน', NOW() - INTERVAL 30 MINUTE, NOW(), 'in_progress', 'กำลังปรุง');

-- สร้าง View สำหรับแสดงข้อมูลสรุป
CREATE OR REPLACE VIEW `production_summary` AS
SELECT 
    pl.id,
    pl.work_plan_id,
    pl.production_date,
    pl.job_code,
    pl.job_name,
    pl.input_material_quantity,
    pl.input_material_unit,
    pl.input_material_name,
    pl.output_quantity,
    pl.output_unit,
    pl.output_product_name,
    pl.yield_percentage,
    pl.operator_name,
    pl.machine_name,
    pl.room_name,
    pl.start_time,
    pl.end_time,
    pl.duration_minutes,
    pl.status,
    pl.notes,
    pl.created_at,
    pl.updated_at,
    
    -- คำนวณเพิ่มเติม
    CASE 
        WHEN pl.yield_percentage >= 95 THEN 'Excellent'
        WHEN pl.yield_percentage >= 90 THEN 'Good'
        WHEN pl.yield_percentage >= 80 THEN 'Fair'
        ELSE 'Poor'
    END as yield_rating,
    
    -- สถานะสี
    CASE 
        WHEN pl.status = 'completed' THEN 'success'
        WHEN pl.status = 'in_progress' THEN 'warning'
        WHEN pl.status = 'pending' THEN 'info'
        ELSE 'danger'
    END as status_color
FROM production_logs pl
ORDER BY pl.production_date DESC, pl.created_at DESC;
