-- สร้างตาราง production_rooms สำหรับจัดการข้อมูลห้องผลิต
CREATE TABLE IF NOT EXISTS production_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'รหัสห้องผลิต',
    room_name VARCHAR(100) NOT NULL COMMENT 'ชื่อห้องผลิต',
    room_type ENUM('hot_kitchen', 'cold_kitchen', 'prep_area', 'storage', 'other') NOT NULL COMMENT 'ประเภทห้องผลิต',
    capacity INT COMMENT 'ความจุสูงสุด (จำนวนคน)',
    location VARCHAR(100) COMMENT 'ตำแหน่งที่ตั้งห้อง',
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active' COMMENT 'สถานะห้อง',
    description TEXT COMMENT 'รายละเอียดเพิ่มเติม',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_code (room_code),
    INDEX idx_room_type (room_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางข้อมูลห้องผลิต';

-- เพิ่มข้อมูลตัวอย่าง
INSERT INTO production_rooms (room_code, room_name, room_type, capacity, location, status, description) VALUES
('HK-A', 'ครัวร้อน A', 'hot_kitchen', 8, 'ชั้น 1 ด้านทิศเหนือ', 'active', 'ห้องครัวร้อนสำหรับทำอาหารร้อน'),
('HK-B', 'ครัวร้อน B', 'hot_kitchen', 6, 'ชั้น 1 ด้านทิศใต้', 'active', 'ห้องครัวร้อนสำหรับทำอาหารร้อน'),
('MEAT', 'ห้อง Meat', 'prep_area', 4, 'ชั้น 1 ด้านทิศตะวันออก', 'active', 'ห้องเตรียมเนื้อสัตว์'),
('RD', 'ห้อง RD', 'other', 6, 'ชั้น 1 ด้านทิศตะวันตก', 'active', 'ห้องวิจัยและพัฒนา'),
('VEG', 'ห้องทำผัก', 'prep_area', 8, 'ชั้น 1 ด้านทิศเหนือ', 'active', 'ห้องเตรียมและทำความสะอาดผัก'),
('MARINATE', 'Marinating room', 'prep_area', 4, 'ชั้น 1 ด้านทิศใต้', 'active', 'ห้องหมักเนื้อสัตว์'),
('SEAFOOD', 'ห้อง Seafood', 'prep_area', 6, 'ชั้น 1 ด้านทิศตะวันออก', 'active', 'ห้องเตรียมอาหารทะเล'),
('BAKERY', 'HOT BAKERY', 'hot_kitchen', 8, 'ชั้น 1 ด้านทิศตะวันตก', 'active', 'ห้องอบขนมและเบเกอรี่'),
('PACK-1', 'Packing 1', 'other', 6, 'ชั้น 1 ด้านทิศเหนือ', 'active', 'ห้องบรรจุภัณฑ์ 1'),
('PACK-2', 'Packing 2', 'other', 6, 'ชั้น 1 ด้านทิศใต้', 'active', 'ห้องบรรจุภัณฑ์ 2'),
('PREMIX', 'Premix', 'prep_area', 4, 'ชั้น 1 ด้านทิศตะวันออก', 'active', 'ห้องเตรียมส่วนผสม'),
('SALES', 'ห้องยิงขาย', 'other', 8, 'ชั้น 1 ด้านทิศตะวันตก', 'active', 'ห้องจัดส่งและขาย'),
('DRY-STOCK', 'สต็อคแห้ง', 'storage', 0, 'ชั้นใต้ดิน', 'active', 'ห้องเก็บวัตถุดิบแห้ง'); 