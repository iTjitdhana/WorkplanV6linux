# แก้ไขปัญหา API URL

## ปัญหาที่พบ
- **Backend API ทำงานได้** (จากผลลัพธ์ Terminal)
- **แต่ Frontend ไม่สามารถลบ/บันทึกได้**
- **สาเหตุ:** Frontend API proxy ใช้ IP address แทน localhost

## การแก้ไขที่ทำแล้ว

### 1. แก้ไข API URLs ✅
เปลี่ยนจาก `192.168.0.94:3101` เป็น `localhost:3101` ในไฟล์:

```typescript
// ก่อนแก้ไข
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.94:3101';

// หลังแก้ไข
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101';
```

### 2. ไฟล์ที่แก้ไขแล้ว ✅
- `frontend/app/api/work-plans/drafts/[id]/route.ts`
- `frontend/app/api/work-plans/drafts/route.ts`
- `frontend/app/api/work-plans/route.ts`
- `frontend/app/api/process-steps/search/route.ts`

## ขั้นตอนการแก้ไข

### 1. รันไฟล์แก้ไข API URLs
```cmd
.\fix-api-urls.bat
```

### 2. รีสตาร์ท Frontend Server
```cmd
# หยุด Frontend server (Ctrl+C)
# รันใหม่
cd frontend
npm run dev

# หรือใช้ไฟล์ batch
.\start-dev-windows.bat
```

### 3. ทดสอบการทำงาน
1. เปิด http://localhost:3011
2. ทดสอบลบงาน
3. ทดสอบบันทึกแบบร่าง
4. ตรวจสอบ Console ใน Browser

## การตรวจสอบ

### 1. ตรวจสอบ Backend (✅ ทำงานได้)
```cmd
netstat -an | findstr :3101
curl "http://localhost:3101/api/work-plans/drafts"
```

### 2. ตรวจสอบ Frontend API Proxy
```cmd
curl "http://localhost:3011/api/work-plans/drafts"
```

### 3. ตรวจสอบ Console ใน Browser
1. เปิด Developer Tools (F12)
2. ไปที่ Console tab
3. ทดสอบลบงานและดู error messages

### 4. ตรวจสอบ Network Tab
1. ไปที่ Network tab ใน Developer Tools
2. ทดสอบลบงานและดู API calls
3. ตรวจสอบ response status และ data

## ปัญหาที่อาจเกิดขึ้น

### ปัญหา: Frontend server ไม่รีสตาร์ท
**วิธีแก้:**
1. หยุด server ด้วย Ctrl+C
2. รันใหม่: `cd frontend && npm run dev`

### ปัญหา: API proxy ยังไม่ทำงาน
**วิธีแก้:**
1. ตรวจสอบไฟล์ API proxy ถูกแก้ไขแล้ว
2. รีสตาร์ท Frontend server
3. ตรวจสอบ environment variables

### ปัญหา: Database ไม่มีข้อมูล
**วิธีแก้:**
```sql
-- เพิ่มข้อมูลทดสอบ
INSERT INTO work_plan_drafts (production_date, job_code, job_name, workflow_status_id) VALUES
('2025-01-08', 'TEST001', 'งานทดสอบ 1', 1),
('2025-01-08', 'TEST002', 'งานทดสอบ 2', 1);
```

## หมายเหตุ

- ใช้ไฟล์ `fix-api-urls.bat` เพื่อแก้ไข API URLs อัตโนมัติ
- หลังจากแก้ไขแล้วต้องรีสตาร์ท Frontend server
- ตรวจสอบ Console ใน browser เพื่อดู error details
- ใช้ Network tab ใน Developer Tools เพื่อดู API calls 