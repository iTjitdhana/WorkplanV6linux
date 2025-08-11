# การแก้ไขปัญหาการ Sync

## ปัญหาที่พบ
1. ระบบ Sync ทำงานได้ แต่มีปัญหาเรื่องวันที่
2. Google Sheet ไม่ได้รับข้อมูล (404 error)
3. ต้องกด F5 เพื่อให้ Frontend เชื่อมต่อ Backend ได้

## การแก้ไขที่ทำ

### 1. แก้ไขการจัดการวันที่
- ปรับปรุงการแปลงวันที่ใน `backend/models/WorkPlan.js`
- ใช้ `formatDateForDatabase()` function เพื่อแปลงวันที่ให้ถูกต้อง
- แก้ไข SQL query ให้ใช้ `DATE()` function เพื่อเปรียบเทียบวันที่

### 2. แก้ไข CORS ใน Backend
- เพิ่มการรองรับ localhost ทุก port
- เพิ่มการรองรับ port 3000 และ 3011
- ปรับปรุงการตั้งค่า CORS ใน `backend/server.js`

### 3. สร้างไฟล์ Script สำหรับรันระบบ
- `start-both.bat` - รันทั้ง Frontend และ Backend
- `start-both.ps1` - PowerShell script สำหรับรันระบบ
- `test-sync.ps1` - ทดสอบระบบ Sync

### 4. ปรับปรุงการจัดการ Error
- เพิ่ม debug log ในระบบ Sync
- ปรับปรุงการจัดการ error ใน Google Sheet proxy

## วิธีการใช้งาน

### รันระบบ
```powershell
.\start-both.ps1
```

### ทดสอบ Sync
```powershell
.\test-sync.ps1
```

### ตรวจสอบสถานะ
- Backend: http://localhost:3101
- Frontend: http://localhost:3011

## การตรวจสอบปัญหา

### ตรวจสอบ Backend
1. เปิด console ของ Backend
2. ดู log การทำงาน
3. ตรวจสอบ error messages

### ตรวจสอบ Frontend
1. เปิด Developer Tools
2. ดู Network tab
3. ตรวจสอบ API calls

### ตรวจสอบฐานข้อมูล
1. ตรวจสอบตาราง `work_plan_drafts`
2. ตรวจสอบตาราง `work_plans`
3. ตรวจสอบตาราง `workplan_sync_log`

## หมายเหตุ
- ระบบ Sync จะทำงานเฉพาะ drafts ที่มี `workflow_status_id = 2`
- ระบบจะกรองออกงาน A, B, C, D จาก sync
- วันที่จะถูกแปลงเป็นรูปแบบ YYYY-MM-DD ก่อนบันทึก 