-- Create production_statuses table
CREATE TABLE IF NOT EXISTS `production_statuses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT 'ชื่อสถานะ',
  `description` text COMMENT 'คำอธิบายสถานะ',
  `color` varchar(7) NOT NULL COMMENT 'สีของสถานะ (hex code)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'สถานะการใช้งาน (1=ใช้งาน, 0=ไม่ใช้งาน)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางสถานะการผลิต';

-- Insert sample data
INSERT INTO `production_statuses` (`name`, `description`, `color`, `is_active`) VALUES
('รอดำเนินการ', 'งานที่ยังไม่ได้เริ่มดำเนินการ', '#FF6B6B', 1),
('กำลังดำเนินการ', 'งานที่กำลังดำเนินการอยู่', '#4ECDC4', 1),
('รอตรวจสอบ', 'งานที่เสร็จแล้วรอการตรวจสอบ', '#45B7D1', 1),
('เสร็จสิ้น', 'งานที่เสร็จสิ้นแล้ว', '#96CEB4', 1),
('ระงับการทำงาน', 'งานที่ถูกระงับการทำงานชั่วคราว', '#FFEAA7', 1),
('ยกเลิก', 'งานที่ถูกยกเลิก', '#DDA0DD', 1),
('ล่าช้า', 'งานที่ล่าช้ากว่ากำหนด', '#FF8C42', 1),
('เร่งด่วน', 'งานที่มีความเร่งด่วนสูง', '#FF4757', 1),
('ยกเลิกการผลิต', 'งานที่ถูกยกเลิกการผลิต', '#FF4757', 1),
('งานพิเศษ', 'งานที่เพิ่มหลัง 18:00 น.', '#FFA500', 1);

-- Add status_id column to work_plans table if not exists
ALTER TABLE `work_plans` 
ADD COLUMN IF NOT EXISTS `status_id` int(11) DEFAULT 1 COMMENT 'สถานะการผลิต' AFTER `production_room_id`,
ADD CONSTRAINT `fk_work_plans_status` FOREIGN KEY (`status_id`) REFERENCES `production_statuses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Update existing work plans to have default status (รอดำเนินการ)
UPDATE `work_plans` SET `status_id` = 1 WHERE `status_id` IS NULL; 