# 🚀 การอัปเดตระบบ Production Logs

## 📋 สรุปการปรับปรุง

ระบบได้รับการปรับปรุงเพื่อรองรับ:
- **แสดงข้อมูลจากวันล่าสุดที่มีข้อมูล**
- **เพิ่มคอลัมน์ Yield %** (คำนวณอัตโนมัติ)
- **ข้อมูลวัตถุดิบเข้า-ออก** พร้อมหน่วย
- **สถิติการผลิต** แบบ Real-time

## 🗄️ ตารางใหม่ที่สร้าง

### 1. ตาราง `production_logs`
```sql
CREATE TABLE production_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_plan_id INT DEFAULT NULL,
  process_number INT DEFAULT NULL,
  production_date DATE NOT NULL,
  job_code VARCHAR(100) NOT NULL,
  job_name VARCHAR(255) NOT NULL,
  
  -- ข้อมูลวัตถุดิบเข้า
  input_material_quantity DECIMAL(10,2) DEFAULT 0,
  input_material_unit VARCHAR(50) DEFAULT '',
  input_material_name VARCHAR(255) DEFAULT '',
  
  -- ข้อมูลผลผลิตออก
  output_quantity DECIMAL(10,2) DEFAULT 0,
  output_unit VARCHAR(50) DEFAULT '',
  output_product_name VARCHAR(255) DEFAULT '',
  
  -- คำนวณ Yield % อัตโนมัติ
  yield_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- ข้อมูลเพิ่มเติม
  operator_id INT DEFAULT NULL,
  operator_name VARCHAR(100) DEFAULT '',
  machine_id INT DEFAULT NULL,
  machine_name VARCHAR(100) DEFAULT '',
  production_room_id INT DEFAULT NULL,
  room_name VARCHAR(100) DEFAULT '',
  
  -- เวลาเริ่ม-จบ
  start_time DATETIME DEFAULT NULL,
  end_time DATETIME DEFAULT NULL,
  duration_minutes INT DEFAULT 0,
  
  -- สถานะ
  status ENUM('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. View `production_summary`
- แสดงข้อมูลสรุปพร้อม Yield Rating
- สถานะสีอัตโนมัติ
- เรียงลำดับตามวันที่ล่าสุด

### 3. Triggers อัตโนมัติ
- `calculate_yield_percentage`: คำนวณ Yield % เมื่อ INSERT
- `update_yield_percentage`: คำนวณ Yield % เมื่อ UPDATE

## 🔗 API Endpoints ใหม่

### Backend API (Port 3101)
```
GET    /api/production-logs/latest          # ข้อมูลล่าสุด
GET    /api/production-logs                 # ข้อมูลทั้งหมด
GET    /api/production-logs/:id             # ข้อมูลตาม ID
POST   /api/production-logs                 # สร้างข้อมูลใหม่
PUT    /api/production-logs/:id             # อัปเดตข้อมูล
DELETE /api/production-logs/:id             # ลบข้อมูล
GET    /api/production-logs/stats/summary   # สถิติสรุป
GET    /api/production-logs/stats/yield-analysis # วิเคราะห์ Yield
GET    /api/production-logs/dashboard/data  # ข้อมูล Dashboard
```

### Frontend API (Port 3011)
```
GET    /api/production-logs/latest
GET    /api/production-logs
GET    /api/production-logs/[id]
POST   /api/production-logs
PUT    /api/production-logs/[id]
DELETE /api/production-logs/[id]
GET    /api/production-logs/stats/summary
GET    /api/production-logs/stats/yield-analysis
```

## 📊 ฟีเจอร์ใหม่

### 1. การคำนวณ Yield % อัตโนมัติ
```javascript
// สูตร: (output_quantity / input_material_quantity) * 100
yield_percentage = (output_quantity / input_material_quantity) * 100
```

### 2. Yield Rating
- **Excellent**: ≥ 95%
- **Good**: ≥ 90%
- **Fair**: ≥ 80%
- **Poor**: < 80%

### 3. สถิติสรุป
- จำนวนงานทั้งหมด
- งานที่เสร็จแล้ว
- งานที่กำลังดำเนินการ
- งานที่รอดำเนินการ
- Yield % เฉลี่ย
- จำนวนวัตถุดิบเข้า-ออก
- เวลาเฉลี่ย

### 4. การแสดงข้อมูลจากวันล่าสุด
```sql
SELECT * FROM production_logs 
WHERE production_date = (
  SELECT MAX(production_date) 
  FROM production_logs 
  WHERE production_date <= CURDATE()
)
ORDER BY created_at DESC
```

## 🛠️ การติดตั้ง

### 1. รัน SQL Script
```bash
.\setup-production-logs.bat
```

### 2. ตรวจสอบการสร้างตาราง
```sql
USE esp_tracker;
SHOW TABLES LIKE 'production_logs';
SELECT COUNT(*) FROM production_logs;
```

### 3. ตรวจสอบ Trigger
```sql
SHOW TRIGGERS LIKE 'production_logs';
```

## 📱 การใช้งาน

### 1. ดูข้อมูลล่าสุด
```javascript
// ดึงข้อมูลจากวันล่าสุดที่มีข้อมูล
const response = await fetch('/api/production-logs/latest');
const data = await response.json();
```

### 2. สร้างข้อมูลใหม่
```javascript
const newLog = {
  production_date: '2025-01-20',
  job_code: 'JOB001',
  job_name: 'ตวงสูตร',
  input_material_quantity: 10.5,
  input_material_unit: 'kg',
  input_material_name: 'แป้งสาลี',
  output_quantity: 9.8,
  output_unit: 'kg',
  output_product_name: 'แป้งผสม',
  operator_name: 'เชฟสมชาย',
  status: 'completed'
};

const response = await fetch('/api/production-logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newLog)
});
```

### 3. ดูสถิติ
```javascript
// สถิติสรุป
const stats = await fetch('/api/production-logs/stats/summary');

// วิเคราะห์ Yield
const yieldAnalysis = await fetch('/api/production-logs/stats/yield-analysis');
```

## 🎯 ตัวอย่างข้อมูล

### ข้อมูลตัวอย่างในตาราง
```sql
INSERT INTO production_logs (
  production_date, job_code, job_name,
  input_material_quantity, input_material_unit, input_material_name,
  output_quantity, output_unit, output_product_name,
  operator_name, status
) VALUES
('2025-01-20', 'JOB001', 'ตวงสูตร', 10.5, 'kg', 'แป้งสาลี', 9.8, 'kg', 'แป้งผสม', 'เชฟสมชาย', 'completed'),
('2025-01-20', 'JOB002', 'นวดแป้ง', 9.8, 'kg', 'แป้งผสม', 9.2, 'kg', 'แป้งนวด', 'เชฟสมชาย', 'completed'),
('2025-01-20', 'JOB003', 'ปรุงอาหาร', 5.0, 'kg', 'เนื้อไก่', 4.2, 'kg', 'ไก่ปรุงสุก', 'เชฟสมชาย', 'in_progress');
```

### ผลลัพธ์ Yield %
- JOB001: 93.33% (Good)
- JOB002: 93.88% (Good)
- JOB003: 84.00% (Fair)

## 🔧 การแก้ไขปัญหา

### 1. ตารางไม่ถูกสร้าง
```bash
# ตรวจสอบการเชื่อมต่อ
mysql -h 192.168.0.94 -u jitdhana -p'iT12345$' -e "USE esp_tracker;"

# รัน SQL ใหม่
mysql -h 192.168.0.94 -u jitdhana -p'iT12345$' esp_tracker < create-production-logs-table.sql
```

### 2. Trigger ไม่ทำงาน
```sql
-- ตรวจสอบ Trigger
SHOW TRIGGERS LIKE 'production_logs';

-- สร้าง Trigger ใหม่
DROP TRIGGER IF EXISTS calculate_yield_percentage;
-- รัน SQL script อีกครั้ง
```

### 3. API ไม่ตอบสนอง
```bash
# ตรวจสอบ Backend
cd backend
npm start

# ตรวจสอบ Frontend
cd frontend
npm run dev
```

## 📈 การพัฒนาต่อ

### 1. เพิ่มฟีเจอร์
- การแจ้งเตือน Yield % ต่ำ
- รายงานเปรียบเทียบรายเดือน
- การส่งข้อมูลไป Google Sheets

### 2. ปรับปรุง UI
- กราฟแสดง Yield % แบบ Real-time
- Dashboard แบบ Interactive
- การพิมพ์รายงาน

### 3. เพิ่มการวิเคราะห์
- การพยากรณ์ Yield % จากข้อมูลย้อนหลัง
- การวิเคราะห์สาเหตุ Yield % ต่ำ
- การแนะนำการปรับปรุง

---

**อัปเดตล่าสุด**: มกราคม 2025  
**เวอร์ชัน**: 2.0  
**ผู้พัฒนา**: ระบบ ESP Tracker
