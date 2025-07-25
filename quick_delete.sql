-- ========================================
-- SQL สำหรับลบข้อมูลด่วน
-- ========================================

-- ⚠️  คำเตือน: โปรดสำรองข้อมูลก่อนใช้งาน

-- ========================================
-- ลบข้อมูลทั้งหมด (ระวัง!)
-- ========================================

-- ปิด Safe Update Mode
SET SQL_SAFE_UPDATES = 0;

-- ลบข้อมูลในตารางหลัก
DELETE FROM work_plans;
DELETE FROM logs;
DELETE FROM work_plan_operators;
DELETE FROM finished_flags;

-- รีเซ็ต Auto Increment
ALTER TABLE work_plans AUTO_INCREMENT = 1;
ALTER TABLE logs AUTO_INCREMENT = 1;
ALTER TABLE work_plan_operators AUTO_INCREMENT = 1;

-- เปิด Safe Update Mode กลับ
SET SQL_SAFE_UPDATES = 1;

-- ========================================
-- หรือใช้ TRUNCATE (เร็วกว่า)
-- ========================================

-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE work_plans;
-- TRUNCATE TABLE logs;
-- TRUNCATE TABLE work_plan_operators;
-- TRUNCATE TABLE finished_flags;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- ตรวจสอบผลลัพธ์
-- ========================================

SELECT 'work_plans' as table_name, COUNT(*) as count FROM work_plans
UNION ALL
SELECT 'logs' as table_name, COUNT(*) as count FROM logs
UNION ALL
SELECT 'work_plan_operators' as table_name, COUNT(*) as count FROM work_plan_operators
UNION ALL
SELECT 'finished_flags' as table_name, COUNT(*) as count FROM finished_flags; 