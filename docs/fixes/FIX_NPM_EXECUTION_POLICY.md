# แก้ไขปัญหา npm Execution Policy

## ปัญหาที่พบ
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded 
because running scripts is disabled on this system.
```

## สาเหตุ
PowerShell Execution Policy ป้องกันการรัน npm scripts

## วิธีแก้ไข

### วิธีที่ 1: ใช้ไฟล์ batch ที่แก้ไขแล้ว (แนะนำ)

รันไฟล์ `start-dev-windows.bat` ที่แก้ไขปัญหาแล้ว:

```cmd
.\start-dev-windows.bat
```

### วิธีที่ 2: แก้ไข Execution Policy ด้วยตนเอง

#### ขั้นตอนที่ 1: เปิด PowerShell แบบ Administrator
1. คลิกขวาที่ Start Menu
2. เลือก "Windows PowerShell (Admin)"

#### ขั้นตอนที่ 2: แก้ไข Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
เลือก "Y" เมื่อถาม

#### ขั้นตอนที่ 3: ตรวจสอบการแก้ไข
```powershell
Get-ExecutionPolicy -Scope CurrentUser
```
ควรแสดงผล: `RemoteSigned`

### วิธีที่ 3: ใช้ไฟล์ batch แก้ไข Execution Policy

```cmd
.\fix-execution-policy.bat
```

## การแก้ไข Backend package.json

ไฟล์ `backend/package.json` ได้ถูกแก้ไขแล้ว:

```json
{
  "scripts": {
    "start": "set NODE_ENV=production && node server.js",
    "dev": "set NODE_ENV=development && nodemon server.js",
    "start:ip": "set NODE_ENV=production && node server.js",
    "dev:ip": "set NODE_ENV=development && nodemon server.js"
  }
}
```

เปลี่ยนจาก `NODE_ENV=development` เป็น `set NODE_ENV=development &&` เพื่อให้ทำงานใน Windows

## ขั้นตอนการรันระบบ

### 1. แก้ไข Execution Policy
```cmd
.\fix-execution-policy.bat
```

### 2. รันระบบ
```cmd
# ใช้ไฟล์ที่แก้ไขแล้ว
.\start-dev-windows.bat

# หรือรันแยกกัน
cd backend && npm run dev
cd frontend && npm run dev
```

### 3. ตรวจสอบการทำงาน
- Backend: http://localhost:3101
- Frontend: http://localhost:3011

## ปัญหาที่อาจเกิดขึ้น

### ปัญหา: Access Denied
**วิธีแก้:**
1. รัน Command Prompt แบบ Administrator
2. หรือใช้ `-Force` flag:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

### ปัญหา: Execution Policy ยังไม่เปลี่ยน
**วิธีแก้:**
1. เปิด PowerShell ใหม่
2. ตรวจสอบ: `Get-ExecutionPolicy -Scope CurrentUser`

### ปัญหา: npm ยังไม่ทำงาน
**วิธีแก้:**
1. ตรวจสอบว่า Node.js ติดตั้งแล้ว
2. เปิด Command Prompt ใหม่
3. ลองใช้ `cmd.exe` แทน PowerShell

## หมายเหตุ

- หลังจากแก้ไข Execution Policy แล้ว npm ควรทำงานได้ปกติ
- ใช้ไฟล์ `start-dev-windows.bat` สำหรับการรันระบบที่สมบูรณ์
- ตรวจสอบว่า MySQL ทำงานอยู่ก่อนรันระบบ 