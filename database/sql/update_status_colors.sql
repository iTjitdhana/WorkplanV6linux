-- อัปเดตสีสถานะใน production_statuses table
-- เปลี่ยนสี "กำลังดำเนินการ" เป็นสีเหลือง

UPDATE `production_statuses` 
SET `color` = '#F59E0B' 
WHERE `name` = 'กำลังดำเนินการ';

-- ตรวจสอบผลลัพธ์
SELECT 
    id,
    name,
    color,
    description
FROM `production_statuses` 
WHERE `name` IN ('รอดำเนินการ', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิกการผลิต')
ORDER BY id; 