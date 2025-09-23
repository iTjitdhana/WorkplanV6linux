-- SQL สำหรับลบข้อมูลใน Table work_plans
-- โปรดเลือกใช้ query ที่เหมาะสมกับความต้องการของคุณ

-- ========================================
-- 1. ลบข้อมูลทั้งหมดใน table work_plans
-- ========================================
-- *** คำเตือน: จะลบข้อมูลทั้งหมด ไม่สามารถกู้คืนได้ ***
-- วิธีที่ 1: ใช้ WHERE กับ KEY column (แนะนำ)
-- DELETE FROM work_plans WHERE id > 0;

-- วิธีที่ 2: ปิด Safe Update Mode ชั่วคราว
-- SET SQL_SAFE_UPDATES = 0;
-- DELETE FROM work_plans;
-- SET SQL_SAFE_UPDATES = 1;

-- วิธีที่ 3: ใช้ TRUNCATE (เร็วกว่าและรีเซ็ต auto increment)
-- TRUNCATE TABLE work_plans;

-- ========================================
-- 2. ลบข้อมูลตามเงื่อนไขเฉพาะ
-- ========================================

-- ลบข้อมูลตาม ID เฉพาะ
-- DELETE FROM work_plans WHERE id = 1;

-- ลบข้อมูลตามช่วงวันที่
-- DELETE FROM work_plans 
-- WHERE production_date BETWEEN '2025-01-01' AND '2025-01-31';

-- ลบข้อมูลตามวันที่เฉพาะ
-- DELETE FROM work_plans 
-- WHERE production_date = '2025-01-20';

-- ลบข้อมูลที่มี status เฉพาะ
-- DELETE FROM work_plans 
-- WHERE status = 'ยกเลิก';

-- ลบข้อมูลที่มี job_name เฉพาะ
-- DELETE FROM work_plans 
-- WHERE job_name LIKE '%ทดสอบ%';

-- ลบข้อมูลที่สร้างก่อนวันที่กำหนด
-- DELETE FROM work_plans 
-- WHERE created_at < '2025-01-01';

-- ========================================
-- 3. ลบข้อมูลแบบปลอดภัย (Safe Delete)
-- ========================================

-- ดูข้อมูลก่อนลบ
SELECT * FROM work_plans 
WHERE production_date = '2025-01-20';

-- ลบข้อมูลหลังจากตรวจสอบแล้ว
-- DELETE FROM work_plans 
-- WHERE production_date = '2025-01-20';

-- ========================================
-- 4. ลบข้อมูลทีละส่วน (Batch Delete)
-- ========================================

-- ลบข้อมูลทีละ 100 records
-- DELETE FROM work_plans 
-- WHERE id IN (
--     SELECT id FROM work_plans 
--     ORDER BY id 
--     LIMIT 100
-- );

-- ========================================
-- 5. Reset Table (ลบข้อมูลทั้งหมดและ reset auto increment)
-- ========================================
-- *** คำเตือน: จะลบข้อมูลทั้งหมดและรีเซ็ต ID counter ***
-- วิธีที่ 1: ใช้ TRUNCATE (แนะนำ - เร็วกว่าและรีเซ็ต auto increment)
-- TRUNCATE TABLE work_plans;

-- วิธีที่ 2: ใช้ DELETE กับ WHERE และรีเซ็ต auto increment
-- DELETE FROM work_plans WHERE id > 0;
-- ALTER TABLE work_plans AUTO_INCREMENT = 1;

-- ========================================
-- 6. Backup ก่อนลบ (แนะนำ)
-- ========================================

-- สร้าง backup table
-- CREATE TABLE work_plans_backup AS SELECT * FROM work_plans;

-- หรือ export ข้อมูลออกมาก่อน
-- SELECT * FROM work_plans 
-- INTO OUTFILE '/tmp/work_plans_backup.csv'
-- FIELDS TERMINATED BY ',' 
-- ENCLOSED BY '"'
-- LINES TERMINATED BY '\n';

-- ========================================
-- 7. ลบข้อมูลที่เกี่ยวข้องใน related tables (ถ้ามี)
-- ========================================

-- ตรวจสอบ foreign key relationships ก่อน
-- SELECT 
--     TABLE_NAME,
--     COLUMN_NAME,
--     REFERENCED_TABLE_NAME,
--     REFERENCED_COLUMN_NAME
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
-- WHERE REFERENCED_TABLE_NAME = 'work_plans';

-- ลบข้อมูลใน related tables ก่อน (ถ้าจำเป็น)
-- DELETE FROM logs WHERE work_plan_id IN (SELECT id FROM work_plans WHERE production_date = '2025-01-20');
-- DELETE FROM work_plans WHERE production_date = '2025-01-20';

-- ========================================
-- คำแนะนำการใช้งาน:
-- ========================================
-- 1. สำรองข้อมูลก่อนลบเสมอ
-- 2. ทดสอบ query ด้วย SELECT ก่อน DELETE
-- 3. ใช้ WHERE clause เพื่อระบุเงื่อนไขที่ชัดเจน
-- 4. ตรวจสอบ foreign key constraints
-- 5. ใช้ LIMIT ในการลบข้อมูลจำนวนมาก
-- 6. สำหรับ Safe Update Mode: ใช้ WHERE กับ KEY column หรือปิด Safe Mode ชั่วคราว
-- ========================================

-- ========================================
-- วิธีแก้ปัญหา Safe Update Mode:
-- ========================================
-- 1. ใช้ WHERE กับ KEY column (แนะนำ)
--    DELETE FROM work_plans WHERE id > 0;

-- 2. ปิด Safe Update Mode ชั่วคราว
--    SET SQL_SAFE_UPDATES = 0;
--    DELETE FROM work_plans;
--    SET SQL_SAFE_UPDATES = 1;

-- 3. ใช้ TRUNCATE แทน DELETE
--    TRUNCATE TABLE work_plans;

-- 4. ปิด Safe Update Mode ใน MySQL Workbench:
--    Edit -> Preferences -> SQL Editor -> Uncheck "Safe Updates"
-- ======================================== 