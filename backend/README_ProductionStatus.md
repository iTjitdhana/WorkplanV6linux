# Production Status Management API

## ภาพรวม
API สำหรับจัดการสถานะการผลิต (Production Status) ในระบบแผนการผลิตครัวกลาง

## Database Schema

### ตาราง `production_statuses`
```sql
CREATE TABLE `production_statuses` (
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
);
```

### ข้อมูลตัวอย่าง
```sql
INSERT INTO `production_statuses` (`name`, `description`, `color`, `is_active`) VALUES
('รอดำเนินการ', 'งานที่ยังไม่ได้เริ่มดำเนินการ', '#FF6B6B', 1),
('กำลังดำเนินการ', 'งานที่กำลังดำเนินการอยู่', '#4ECDC4', 1),
('รอตรวจสอบ', 'งานที่เสร็จแล้วรอการตรวจสอบ', '#45B7D1', 1),
('เสร็จสิ้น', 'งานที่เสร็จสิ้นแล้ว', '#96CEB4', 1),
('ระงับการทำงาน', 'งานที่ถูกระงับการทำงานชั่วคราว', '#FFEAA7', 1),
('ยกเลิก', 'งานที่ถูกยกเลิก', '#DDA0DD', 1),
('ล่าช้า', 'งานที่ล่าช้ากว่ากำหนด', '#FF8C42', 1),
('เร่งด่วน', 'งานที่มีความเร่งด่วนสูง', '#FF4757', 1);
```

## API Endpoints

### 1. ดึงรายการสถานะการผลิตทั้งหมด
```
GET /api/production-statuses
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "รอดำเนินการ",
      "description": "งานที่ยังไม่ได้เริ่มดำเนินการ",
      "color": "#FF6B6B",
      "is_active": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "ดึงรายการสถานะการผลิตสำเร็จ"
}
```

### 2. ดึงรายการสถานะการผลิตที่ใช้งานได้
```
GET /api/production-statuses/active
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "รอดำเนินการ",
      "description": "งานที่ยังไม่ได้เริ่มดำเนินการ",
      "color": "#FF6B6B",
      "is_active": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "ดึงรายการสถานะการผลิตที่ใช้งานได้สำเร็จ"
}
```

### 3. ดึงข้อมูลสถานะการผลิตตาม ID
```
GET /api/production-statuses/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "รอดำเนินการ",
    "description": "งานที่ยังไม่ได้เริ่มดำเนินการ",
    "color": "#FF6B6B",
    "is_active": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "ดึงข้อมูลสถานะการผลิตสำเร็จ"
}
```

### 4. สร้างสถานะการผลิตใหม่
```
POST /api/production-statuses
```

**Request Body:**
```json
{
  "name": "สถานะใหม่",
  "description": "คำอธิบายสถานะใหม่",
  "color": "#FF0000",
  "is_active": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 9,
    "name": "สถานะใหม่",
    "description": "คำอธิบายสถานะใหม่",
    "color": "#FF0000",
    "is_active": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "สร้างสถานะการผลิตใหม่สำเร็จ"
}
```

### 5. แก้ไขข้อมูลสถานะการผลิต
```
PUT /api/production-statuses/:id
```

**Request Body:**
```json
{
  "name": "สถานะที่แก้ไขแล้ว",
  "description": "คำอธิบายที่แก้ไขแล้ว",
  "color": "#00FF00",
  "is_active": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "สถานะที่แก้ไขแล้ว",
    "description": "คำอธิบายที่แก้ไขแล้ว",
    "color": "#00FF00",
    "is_active": 0,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  },
  "message": "อัพเดทสถานะการผลิตสำเร็จ"
}
```

### 6. ลบสถานะการผลิต
```
DELETE /api/production-statuses/:id
```

**Response:**
```json
{
  "success": true,
  "message": "ลบสถานะการผลิตสำเร็จ"
}
```

### 7. อัพเดทสถานะแผนการผลิต
```
PATCH /api/production-statuses/work-plans/:id/status
```

**Request Body:**
```json
{
  "status_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "production_date": "2024-01-01",
    "job_code": "JOB001",
    "job_name": "งานตัวอย่าง",
    "start_time": "08:00:00",
    "end_time": "17:00:00",
    "status_id": 2
  },
  "message": "อัพเดทสถานะแผนการผลิตสำเร็จ"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "กรุณากรอกชื่อสถานะและสี"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "ไม่พบสถานะการผลิตที่ระบุ"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "เกิดข้อผิดพลาดในการดึงรายการสถานะการผลิต",
  "error": "Error details"
}
```

## การใช้งานใน Frontend

### TypeScript Interfaces
```typescript
export interface ProductionStatus {
  id: number;
  name: string;
  description?: string;
  color: string;
  is_active: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateProductionStatusData {
  name: string;
  description?: string;
  color: string;
  is_active?: number;
}

export interface UpdateProductionStatusData {
  name?: string;
  description?: string;
  color?: string;
  is_active?: number;
}

export interface UpdateWorkPlanStatusData {
  status_id: number;
}
```

### React Hook Usage
```typescript
import { useProductionStatuses, useActiveProductionStatuses } from '../hooks/useProductionStatuses';

// ดึงสถานะทั้งหมด
const { statuses, loading, error, createStatus, updateStatus, deleteStatus } = useProductionStatuses();

// ดึงเฉพาะสถานะที่ใช้งานได้
const { statuses: activeStatuses, loading, error } = useActiveProductionStatuses();
```

## การติดตั้ง

1. รัน SQL script เพื่อสร้างตาราง:
```bash
mysql -u username -p database_name < production_statuses.sql
```

2. ตรวจสอบว่า routes ถูกเพิ่มใน `backend/routes/index.js`:
```javascript
const productionStatusRoutes = require('./productionStatusRoutes');
router.use('/production-statuses', productionStatusRoutes);
```

3. รีสตาร์ท backend server:
```bash
npm run dev
```

## การทดสอบ

ทดสอบ API ด้วย curl หรือ Postman:

```bash
# ดึงรายการสถานะทั้งหมด
curl http://localhost:3007/api/production-statuses

# สร้างสถานะใหม่
curl -X POST http://localhost:3007/api/production-statuses \
  -H "Content-Type: application/json" \
  -d '{"name":"ทดสอบ","description":"สถานะทดสอบ","color":"#FF0000"}'

# อัพเดทสถานะแผนการผลิต
curl -X PATCH http://localhost:3007/api/production-statuses/work-plans/1/status \
  -H "Content-Type: application/json" \
  -d '{"status_id":2}'
``` 