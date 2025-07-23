-- Simple database fix for production planning system (MySQL compatible)

-- 1. Create production_statuses table
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

-- 2. Insert production statuses
INSERT INTO `production_statuses` (`id`, `name`, `description`, `color`, `is_active`) VALUES
(1, 'รอดำเนินการ', 'งานที่ยังไม่ได้เริ่มดำเนินการ', '#FF6B6B', 1),
(2, 'กำลังดำเนินการ', 'งานที่กำลังดำเนินการอยู่', '#4ECDC4', 1),
(3, 'รอตรวจสอบ', 'งานที่เสร็จแล้วรอการตรวจสอบ', '#45B7D1', 1),
(4, 'เสร็จสิ้น', 'งานที่เสร็จสิ้นแล้ว', '#96CEB4', 1),
(5, 'ระงับการทำงาน', 'งานที่ถูกระงับการทำงานชั่วคราว', '#FFEAA7', 1),
(6, 'ยกเลิก', 'งานที่ถูกยกเลิก', '#DDA0DD', 1),
(7, 'ล่าช้า', 'งานที่ล่าช้ากว่ากำหนด', '#FF8C42', 1),
(8, 'เร่งด่วน', 'งานที่มีความเร่งด่วนสูง', '#FF4757', 1),
(9, 'ยกเลิกการผลิต', 'งานที่ถูกยกเลิกการผลิต', '#FF4757', 1),
(10, 'งานพิเศษ', 'งานที่เพิ่มหลัง 18:00 น.', '#FFA500', 1)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `color` = VALUES(`color`),
  `is_active` = VALUES(`is_active`);

-- 3. Add status_id column to work_plans table (run this manually if needed)
-- ALTER TABLE `work_plans` ADD COLUMN `status_id` int(11) DEFAULT 1 COMMENT 'สถานะการผลิต';

-- 4. Add foreign key constraint (run this manually if needed)
-- ALTER TABLE `work_plans` ADD CONSTRAINT `fk_work_plans_status` FOREIGN KEY (`status_id`) REFERENCES `production_statuses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Update existing work plans
-- UPDATE `work_plans` SET `status_id` = 1 WHERE `status_id` IS NULL; 