-- แก้ไขตาราง work_plans เพื่อรองรับ status_id และ notes

-- 1. เพิ่มคอลัมน์ notes (ถ้ายังไม่มี)
ALTER TABLE `work_plans` ADD COLUMN `notes` text COLLATE utf8mb4_unicode_520_ci DEFAULT NULL COMMENT 'หมายเหตุ';

-- 2. เพิ่มคอลัมน์ status_id (ถ้ายังไม่มี)
ALTER TABLE `work_plans` ADD COLUMN `status_id` int(11) DEFAULT 1 COMMENT 'สถานะการผลิต';

-- 3. เพิ่ม foreign key constraint (ถ้ายังไม่มี)
ALTER TABLE `work_plans` ADD CONSTRAINT `fk_work_plans_status`
FOREIGN KEY (`status_id`) REFERENCES `production_statuses` (`id`)
ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. อัปเดตข้อมูลที่มีอยู่ให้มี status_id = 1 (รอดำเนินการ)
UPDATE `work_plans` SET `status_id` = 1 WHERE `status_id` IS NULL;

-- 5. ตรวจสอบว่าตาราง production_statuses มีข้อมูลหรือไม่
-- ถ้าไม่มี ให้เพิ่มข้อมูลสถานะ
INSERT IGNORE INTO `production_statuses` (`id`, `name`, `description`, `color`, `is_active`) VALUES
(1, 'รอดำเนินการ', 'งานที่ยังไม่ได้เริ่มดำเนินการ', '#FF6B6B', 1),
(2, 'กำลังดำเนินการ', 'งานที่กำลังดำเนินการอยู่', '#4ECDC4', 1),
(3, 'รอตรวจสอบ', 'งานที่เสร็จแล้วรอการตรวจสอบ', '#45B7D1', 1),
(4, 'เสร็จสิ้น', 'งานที่เสร็จสิ้นแล้ว', '#96CEB4', 1),
(5, 'ระงับการทำงาน', 'งานที่ถูกระงับการทำงานชั่วคราว', '#FFEAA7', 1),
(6, 'ยกเลิก', 'งานที่ถูกยกเลิก', '#DDA0DD', 1),
(7, 'ล่าช้า', 'งานที่ล่าช้ากว่ากำหนด', '#FF8C42', 1),
(8, 'เร่งด่วน', 'งานที่มีความเร่งด่วนสูง', '#FF4757', 1),
(9, 'ยกเลิกการผลิต', 'งานที่ถูกยกเลิกการผลิต', '#FF4757', 1),
(10, 'งานพิเศษ', 'งานที่เพิ่มหลัง 18:00 น.', '#FFA500', 1); 