-- ========================================
-- SQL สำหรับลบข้อมูลในตารางต่างๆ
-- ESP Tracker Database
-- ========================================

-- ⚠️  คำเตือน: โปรดสำรองข้อมูลก่อนใช้งาน
-- ⚠️  การลบข้อมูลไม่สามารถกู้คืนได้

-- ========================================
-- 1. ลบข้อมูลทั้งหมดในตารางหลัก
-- ========================================

-- ลบข้อมูลในตาราง work_plans (แผนการผลิต)
-- วิธีที่ 1: ลบทั้งหมด
DELETE FROM work_plans WHERE id > 0;

-- วิธีที่ 2: ลบตามวันที่
-- DELETE FROM work_plans WHERE production_date = '2025-01-20';

-- วิธีที่ 3: ลบตามช่วงวันที่
-- DELETE FROM work_plans WHERE production_date BETWEEN '2025-01-01' AND '2025-01-31';

-- วิธีที่ 4: ลบเฉพาะ drafts
-- DELETE FROM work_plans WHERE workflow_status_id = 1;

-- วิธีที่ 5: ลบเฉพาะงานที่เสร็จแล้ว
-- DELETE FROM work_plans WHERE workflow_status_id = 2;

-- ========================================
-- 2. ลบข้อมูลในตารางที่เกี่ยวข้อง
-- ========================================

-- ลบข้อมูลในตาราง work_plan_operators (ผู้ปฏิบัติงาน)
DELETE FROM work_plan_operators WHERE work_plan_id > 0;

-- ลบข้อมูลในตาราง logs (บันทึกการทำงาน)
DELETE FROM logs WHERE work_plan_id > 0;

-- ลบข้อมูลในตาราง finished_flags (สถานะเสร็จสิ้น)
DELETE FROM finished_flags WHERE work_plan_id > 0;

-- ========================================
-- 3. ลบข้อมูลในตาราง master data (ระวัง!)
-- ========================================

-- ลบข้อมูลในตาราง users (ผู้ใช้)
-- DELETE FROM users WHERE id > 0;

-- ลบข้อมูลในตาราง machines (เครื่องจักร)
-- DELETE FROM machines WHERE id > 0;

-- ลบข้อมูลในตาราง production_rooms (ห้องผลิต)
-- DELETE FROM production_rooms WHERE id > 0;

-- ลบข้อมูลในตาราง process_steps (ขั้นตอนการผลิต)
-- DELETE FROM process_steps WHERE id > 0;

-- ลบข้อมูลในตาราง production_statuses (สถานะการผลิต)
-- DELETE FROM production_statuses WHERE id > 0;

-- ========================================
-- 4. ลบข้อมูลแบบปลอดภัย (แนะนำ)
-- ========================================

-- ตรวจสอบข้อมูลก่อนลบ
-- SELECT COUNT(*) as total_work_plans FROM work_plans;
-- SELECT COUNT(*) as total_logs FROM logs;
-- SELECT COUNT(*) as total_operators FROM work_plan_operators;

-- ลบข้อมูลตามเงื่อนไขเฉพาะ
-- DELETE FROM work_plans WHERE production_date < '2025-01-01';
-- DELETE FROM logs WHERE created_at < '2025-01-01';

-- ========================================
-- 5. Reset Auto Increment (ถ้าต้องการ)
-- ========================================

-- รีเซ็ต auto increment ของตารางหลัก
ALTER TABLE work_plans AUTO_INCREMENT = 1;
ALTER TABLE logs AUTO_INCREMENT = 1;
ALTER TABLE work_plan_operators AUTO_INCREMENT = 1;

-- รีเซ็ต auto increment ของตาราง master (ถ้าลบ)
-- ALTER TABLE users AUTO_INCREMENT = 1;
-- ALTER TABLE machines AUTO_INCREMENT = 1;
-- ALTER TABLE production_rooms AUTO_INCREMENT = 1;
-- ALTER TABLE process_steps AUTO_INCREMENT = 1;
-- ALTER TABLE production_statuses AUTO_INCREMENT = 1;

-- ========================================
-- 6. ลบข้อมูลแบบ Batch (สำหรับข้อมูลจำนวนมาก)
-- ========================================

-- ลบข้อมูลทีละ 100 records
-- DELETE FROM work_plans 
-- WHERE id IN (
--     SELECT id FROM work_plans 
--     ORDER BY id 
--     LIMIT 100
-- );

-- ========================================
-- 7. ลบข้อมูลตาม Foreign Key (ปลอดภัย)
-- ========================================

-- ลบข้อมูลที่เกี่ยวข้องก่อน แล้วค่อยลบข้อมูลหลัก
-- DELETE FROM logs WHERE work_plan_id IN (SELECT id FROM work_plans WHERE production_date = '2025-01-20');
-- DELETE FROM work_plan_operators WHERE work_plan_id IN (SELECT id FROM work_plans WHERE production_date = '2025-01-20');
-- DELETE FROM finished_flags WHERE work_plan_id IN (SELECT id FROM work_plans WHERE production_date = '2025-01-20');
-- DELETE FROM work_plans WHERE production_date = '2025-01-20';

-- ========================================
-- 8. ใช้ TRUNCATE (เร็วกว่า แต่ระวัง!)
-- ========================================

-- TRUNCATE จะลบข้อมูลทั้งหมดและรีเซ็ต auto increment
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE work_plans;
-- TRUNCATE TABLE logs;
-- TRUNCATE TABLE work_plan_operators;
-- TRUNCATE TABLE finished_flags;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- 9. Backup ก่อนลบ (สำคัญ!)
-- ========================================

-- สร้าง backup table
-- CREATE TABLE work_plans_backup AS SELECT * FROM work_plans;
-- CREATE TABLE logs_backup AS SELECT * FROM logs;
-- CREATE TABLE work_plan_operators_backup AS SELECT * FROM work_plan_operators;

-- Export ข้อมูลออกไฟล์ CSV
-- SELECT * FROM work_plans 
-- INTO OUTFILE '/tmp/work_plans_backup.csv'
-- FIELDS TERMINATED BY ',' 
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n';

-- ========================================
-- 10. ตรวจสอบผลลัพธ์
-- ========================================

-- ตรวจสอบจำนวนข้อมูลที่เหลือ
-- SELECT 'work_plans' as table_name, COUNT(*) as count FROM work_plans
-- UNION ALL
-- SELECT 'logs' as table_name, COUNT(*) as count FROM logs
-- UNION ALL
-- SELECT 'work_plan_operators' as table_name, COUNT(*) as count FROM work_plan_operators
-- UNION ALL
-- SELECT 'finished_flags' as table_name, COUNT(*) as count FROM finished_flags;

-- ========================================
-- คำแนะนำการใช้งาน:
-- ========================================
-- 1. สำรองข้อมูลก่อนลบเสมอ
-- 2. ทดสอบด้วย SELECT ก่อน DELETE
-- 3. ใช้ WHERE clause เพื่อระบุเงื่อนไขที่ชัดเจน
-- 4. ตรวจสอบ foreign key constraints
-- 5. ลบข้อมูลที่เกี่ยวข้องก่อนข้อมูลหลัก
-- 6. ใช้ LIMIT ในการลบข้อมูลจำนวนมาก
-- 7. ตรวจสอบผลลัพธ์หลังลบเสมอ

-- ========================================
-- วิธีแก้ปัญหา Safe Update Mode:
-- ========================================
-- SET SQL_SAFE_UPDATES = 0;
-- -- รันคำสั่ง DELETE ที่นี่
-- SET SQL_SAFE_UPDATES = 1;

-- หรือใช้ WHERE กับ KEY column
-- DELETE FROM work_plans WHERE id > 0; 