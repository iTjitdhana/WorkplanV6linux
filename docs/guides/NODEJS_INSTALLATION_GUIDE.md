# Node.js Installation Guide

## ปัญหาที่พบ
ระบบไม่พบ Node.js และ npm ซึ่งจำเป็นสำหรับการรันโปรเจค

## วิธีการติดตั้ง Node.js

### วิธีที่ 1: ดาวน์โหลดจากเว็บไซต์ (แนะนำ)

1. **ไปที่เว็บไซต์ Node.js**
   - เปิดเบราว์เซอร์ไปที่: https://nodejs.org/

2. **ดาวน์โหลด Node.js LTS**
   - เลือก "LTS" version (แนะนำ)
   - คลิกปุ่ม "Download" สีเขียว

3. **ติดตั้ง Node.js**
   - รันไฟล์ .msi ที่ดาวน์โหลด
   - กด "Next" ตลอด
   - เลือก "Install" เมื่อเสร็จ

4. **ตรวจสอบการติดตั้ง**
   - เปิด Command Prompt หรือ PowerShell ใหม่
   - รันคำสั่ง: `node --version`
   - รันคำสั่ง: `npm --version`

### วิธีที่ 2: ใช้ Chocolatey (ถ้ามี)

1. **เปิด Command Prompt แบบ Administrator**
   - คลิกขวาที่ Start Menu
   - เลือก "Windows PowerShell (Admin)" หรือ "Command Prompt (Admin)"

2. **ติดตั้ง Node.js**
   ```cmd
   choco install nodejs
   ```

3. **ตรวจสอบการติดตั้ง**
   ```cmd
   node --version
   npm --version
   ```

### วิธีที่ 3: ใช้ winget (Windows 10/11)

1. **เปิด Command Prompt แบบ Administrator**

2. **ติดตั้ง Node.js**
   ```cmd
   winget install OpenJS.NodeJS
   ```

3. **ตรวจสอบการติดตั้ง**
   ```cmd
   node --version
   npm --version
   ```

## หลังจากติดตั้ง Node.js

### 1. ตรวจสอบการติดตั้ง
```cmd
node --version
npm --version
```

### 2. ติดตั้ง Dependencies
```cmd
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 3. รันระบบ
```cmd
# Development Mode (localhost)
.\start-dev.bat

# หรือ Production Mode (192.168.0.94)
.\start-production.bat
```

## การแก้ไขปัญหา

### ปัญหา: 'node' is not recognized
**วิธีแก้:**
1. ตรวจสอบว่า Node.js ติดตั้งแล้วหรือไม่
2. เปิด Command Prompt ใหม่
3. ตรวจสอบ PATH environment variable

### ปัญหา: 'npm' is not recognized
**วิธีแก้:**
1. ติดตั้ง Node.js ใหม่
2. ตรวจสอบว่า npm ติดตั้งมาด้วย
3. เปิด Command Prompt ใหม่

### ปัญหา: Permission denied
**วิธีแก้:**
1. รัน Command Prompt แบบ Administrator
2. หรือใช้ PowerShell แทน

## หมายเหตุ

- Node.js จะติดตั้ง npm มาให้ด้วย
- หลังจากติดตั้งแล้ว ต้องเปิด Command Prompt ใหม่
- ตรวจสอบ PATH environment variable ว่ามี Node.js หรือไม่
- แนะนำให้ใช้ Node.js LTS version สำหรับความเสถียร 