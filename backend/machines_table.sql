-- สร้างตาราง machines สำหรับจัดการข้อมูลเครื่องบันทึกข้อมูลการผลิต
CREATE TABLE IF NOT EXISTS machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    machine_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสเครื่อง',
    machine_name VARCHAR(100) NOT NULL COMMENT 'ชื่อเครื่อง',
    machine_type VARCHAR(50) NOT NULL COMMENT 'ประเภทเครื่อง (NEC, iPad, FUJI, etc.)',
    location VARCHAR(100) COMMENT 'ตำแหน่งที่ตั้งเครื่อง',
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active' COMMENT 'สถานะเครื่อง',
    description TEXT COMMENT 'รายละเอียดเพิ่มเติม',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_machine_code (machine_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางข้อมูลเครื่องบันทึกข้อมูลการผลิต';

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO machines (machine_code, machine_name, machine_type, location, status, description) VALUES
('NEC-01', 'NEC Terminal 01', 'NEC', 'ครัวร้อน A', 'active', 'เครื่องบันทึกข้อมูลการผลิต NEC รุ่นใหม่'),
('iPad-01', 'iPad Terminal 01', 'iPad', 'ครัวร้อน B', 'active', 'iPad สำหรับบันทึกข้อมูลการผลิต'),
('FUJI-01', 'FUJI Terminal 01', 'FUJI', 'ครัวเย็น A', 'active', 'เครื่องบันทึกข้อมูลการผลิต FUJI'),
('NEC-02', 'NEC Terminal 02', 'NEC', 'ครัวร้อน C', 'active', 'เครื่องบันทึกข้อมูลการผลิต NEC รุ่นใหม่'),
('iPad-02', 'iPad Terminal 02', 'iPad', 'ครัวเย็น B', 'maintenance', 'iPad สำหรับบันทึกข้อมูลการผลิต (กำลังซ่อมบำรุง)'); 