-- เพิ่มคอลัมน์ operators ในตาราง work_plans
-- สำหรับเก็บข้อมูลผู้ปฏิบัติงานในรูปแบบ JSON

-- ตรวจสอบว่าคอลัมน์ operators มีอยู่แล้วหรือไม่
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'work_plans' 
     AND COLUMN_NAME = 'operators') = 0,
    'ALTER TABLE work_plans ADD COLUMN operators JSON DEFAULT NULL COMMENT "ข้อมูลผู้ปฏิบัติงานในรูปแบบ JSON"',
    'SELECT "Column operators already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- อัปเดตข้อมูลที่มีอยู่ให้มี operators เป็น NULL (ถ้าจำเป็น)
-- UPDATE work_plans SET operators = NULL WHERE operators IS NULL;

-- แสดงผลลัพธ์
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'work_plans' 
AND COLUMN_NAME = 'operators'; 