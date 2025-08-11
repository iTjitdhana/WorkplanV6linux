# แก้ไขปัญหา Node.js และ Dependencies

## ปัญหาที่พบ
1. **npm ทำงานได้แล้ว** แต่ยังมีปัญหา:
   - `NODE_ENV=development` ไม่ทำงานใน Windows
   - `nodemon` ไม่พบ
   - `next` ไม่พบ

## วิธีแก้ไข

### 1. ติดตั้ง Dependencies ที่จำเป็น

รันไฟล์ `install-dependencies.bat` เพื่อติดตั้ง:
- nodemon (สำหรับ backend)
- Backend dependencies
- Frontend dependencies

```cmd
.\install-dependencies.bat
```

### 2. ใช้ไฟล์ batch ที่แก้ไขแล้ว

แทนที่จะใช้ `start-dev.bat` ให้ใช้ `start-dev-fixed.bat`:

```cmd
# Development Mode (localhost)
.\start-dev-fixed.bat

# Production Mode (192.168.0.94)
.\start-production.bat
```

### 3. ตรวจสอบการติดตั้ง

```cmd
# ตรวจสอบ Node.js
node --version

# ตรวจสอบ npm
npm --version

# ตรวจสอบ nodemon
nodemon --version

# ตรวจสอบ next
npx next --version
```

## ปัญหาที่อาจเกิดขึ้น

### ปัญหา: 'nodemon' is not recognized
**วิธีแก้:**
```cmd
npm install -g nodemon
```

### ปัญหา: 'next' is not recognized
**วิธีแก้:**
```cmd
cd frontend
npm install
```

### ปัญหา: PowerShell Execution Policy
**วิธีแก้:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ปัญหา: NODE_ENV ไม่ทำงาน
**วิธีแก้:**
ใช้ไฟล์ `start-dev-fixed.bat` แทน `start-dev.bat`

## ขั้นตอนการรันระบบ

### 1. ติดตั้ง Dependencies
```cmd
.\install-dependencies.bat
```

### 2. รันระบบ
```cmd
# Development Mode
.\start-dev-fixed.bat

# หรือ Production Mode
.\start-production.bat
```

### 3. ตรวจสอบการทำงาน
- Backend: http://localhost:3101 (Development) หรือ http://192.168.0.94:3101 (Production)
- Frontend: http://localhost:3011 (Development) หรือ http://192.168.0.94:3011 (Production)

## หมายเหตุ

- หลังจากติดตั้ง dependencies แล้ว ระบบควรทำงานได้ปกติ
- ใช้ไฟล์ `start-dev-fixed.bat` สำหรับ Development mode
- ใช้ไฟล์ `start-production.bat` สำหรับ Production mode
- ตรวจสอบว่า MySQL ทำงานอยู่ก่อนรันระบบ 