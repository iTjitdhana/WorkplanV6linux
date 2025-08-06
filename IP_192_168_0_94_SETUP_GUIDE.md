# คู่มือการตั้งค่าระบบให้รันด้วย IP 192.168.0.94

## ขั้นตอนการตั้งค่า

### 1. รันคำสั่งตั้งค่า

**สำหรับ Windows Command Prompt:**
```cmd
setup-ip-192-168-0-94.bat
```

**สำหรับ PowerShell:**
```powershell
.\setup-ip-192-168-0-94.ps1
```

### 2. เริ่มต้นระบบ

**สำหรับ Windows Command Prompt:**
```cmd
start-with-ip-192-168-0-94.bat
```

**สำหรับ PowerShell:**
```powershell
.\start-with-ip-192-168-0-94.ps1
```

## การเข้าถึงระบบ

- **Frontend (หน้าเว็บหลัก):** http://192.168.0.94:3011
- **Backend API:** http://192.168.0.94:3101

## ข้อกำหนดเบื้องต้น

### 1. MySQL Database
- ต้องมี MySQL Server ที่รัน
- Database name: `esp_tracker`
- ตั้งค่า username และ password ใน `backend/.env`

### 2. Network Configuration
- ต้องมี IP address 192.168.0.94 ที่สามารถเข้าถึงได้
- เปิด port 3101 และ 3011 ใน firewall
- ตรวจสอบว่าอุปกรณ์อื่นในเครือข่ายสามารถเข้าถึง IP นี้ได้

### 3. Dependencies
- Node.js และ npm ต้องติดตั้งแล้ว
- รัน `npm install` ใน folder backend และ frontend (ถ้ายังไม่ได้รัน)

## การตรวจสอบการทำงาน

### 1. ตรวจสอบ Backend
```cmd
curl http://192.168.0.94:3101/api/users
```

### 2. ตรวจสอบ Frontend
เปิดเบราว์เซอร์ไปที่: http://192.168.0.94:3011

## การแก้ไขปัญหา

### ปัญหา: Cannot connect to database
**แก้ไข:**
1. ตรวจสอบ MySQL service ว่ารันอยู่
2. แก้ไข `backend/.env` ให้ใส่ password ที่ถูกต้อง
3. ตรวจสอบ database name และ user permissions

### ปัญหา: Port already in use
**แก้ไข:**
1. หยุดโปรเซสที่ใช้ port 3101 หรือ 3011
2. หรือแก้ไข port ใน environment files

### ปัญหา: Cannot access from other devices
**แก้ไข:**
1. ตรวจสอบ Windows Firewall
2. ตรวจสอบ network configuration
3. ตรวจสอบว่า IP 192.168.0.94 ถูกต้อง

## ไฟล์ที่ถูกสร้าง

- `backend/.env` - Backend environment variables
- `frontend/.env.local` - Frontend environment variables

## การยกเลิกการตั้งค่า

หากต้องการกลับไปใช้ localhost:
1. ลบไฟล์ `backend/.env`
2. ลบไฟล์ `frontend/.env.local`
3. ใช้คำสั่ง start ปกติ

## หมายเหตุสำคัญ

- ระบบจะใช้ port 3101 สำหรับ backend และ 3011 สำหรับ frontend
- CORS ได้ถูกตั้งค่าให้รองรับ IP 192.168.0.94 แล้ว
- ตรวจสอบให้แน่ใจว่า firewall อนุญาตการเชื่อมต่อบน ports เหล่านี้