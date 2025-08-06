# คู่มือการเริ่มต้นใช้งานระบบ

## วิธีการรันระบบ

### วิธีที่ 1: ใช้ PowerShell Script (แนะนำ)
```powershell
.\start-both.ps1
```

### วิธีที่ 2: ใช้ Batch Script
```cmd
start-both.bat
```

### วิธีที่ 3: รันแยกกัน

#### รัน Backend:
```powershell
cd backend
npm start
```

#### รัน Frontend:
```powershell
cd frontend
npm run dev
```

## URL ที่ใช้งาน

- **Backend API**: http://localhost:3101
- **Frontend**: http://localhost:3011

## การแก้ไขปัญหา

### ปัญหา: ไม่สามารถเชื่อมต่อ Backend ได้
1. ตรวจสอบว่า Backend รันที่ port 3101
2. ตรวจสอบว่าไม่มี error ใน console ของ Backend
3. ลองกด F5 เพื่อ refresh หน้าเว็บ

### ปัญหา: CORS Error
- Backend ได้ตั้งค่า CORS ให้รองรับ localhost ทุก port แล้ว
- หากยังมีปัญหา ให้ตรวจสอบ console ใน browser

### ปัญหา: PowerShell ไม่รองรับ && operator
- ใช้ไฟล์ script ที่เตรียมไว้ให้
- หรือรันคำสั่งแยกกัน

### ปัญหา: Sync ไม่ทำงานหรือมีปัญหาเรื่องวันที่
1. ตรวจสอบว่า Backend รันอยู่
2. ใช้ไฟล์ test-sync.ps1 เพื่อทดสอบ API
3. ตรวจสอบ log ใน Backend console
4. ตรวจสอบข้อมูลในฐานข้อมูล

### ปัญหา: Google Sheet ไม่ได้รับข้อมูล
- ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
- ตรวจสอบ URL ของ Google Apps Script
- ตรวจสอบ log ใน Backend console

## การตรวจสอบสถานะ

1. เปิด browser ไปที่ http://localhost:3011
2. ตรวจสอบ Network tab ใน Developer Tools
3. ดูว่ามีการเรียก API ไปที่ Backend หรือไม่

## การ Debug

### ตรวจสอบ Backend:
```powershell
curl http://localhost:3101/api/work-plans
```

### ตรวจสอบ Frontend:
เปิด Developer Tools และดู Console tab 