# 🚀 คู่มือการรันโปรเจคหลัง Git Clone

## 📋 **ขั้นตอนการ Setup หลัง Clone**

### 1. 📁 **Clone โปรเจค**
```bash
git clone https://github.com/iTjitdhana/WorkplanV5.git
cd WorkplanV5
```

### 2. 🗄️ **Setup Database MySQL**

#### 2.1 ติดตั้ง MySQL (ถ้ายังไม่มี)
```bash
# Windows - ดาวน์โหลดจาก https://dev.mysql.com/downloads/installer/
# หรือใช้ XAMPP: https://www.apachefriends.org/
```

#### 2.2 สร้าง Database
```sql
CREATE DATABASE workplan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2.3 รัน SQL Scripts
```bash
# รัน script หลัก
mysql -u root -p workplan < backend/fix_database.sql

# รัน script เพิ่ม operators column (ถ้าจำเป็น)
mysql -u root -p workplan < backend/add_operators_column.sql

# อัปเดตสีสถานะ (ถ้าจำเป็น)
mysql -u root -p workplan < update-status-colors.sql
```

### 3. 🔧 **Setup Backend**

#### 3.1 ติดตั้ง Dependencies
```bash
cd backend
npm install
```

#### 3.2 สร้างไฟล์ .env
```bash
# สร้างไฟล์ backend/.env
cp backend/.env.example backend/.env
# หรือสร้างไฟล์ใหม่
```

#### 3.3 ตั้งค่า Environment Variables
```env
# backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=workplan
DB_PORT=3306

PORT=3101
NODE_ENV=development

# Google Apps Script URL (ถ้ามี)
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

#### 3.4 รัน Backend
```bash
# Development mode
npm run dev

# หรือ Production mode
npm start
```

### 4. 🌐 **Setup Frontend**

#### 4.1 ติดตั้ง Dependencies
```bash
cd frontend
npm install
# หรือใช้ pnpm
pnpm install
```

#### 4.2 สร้างไฟล์ .env.local
```bash
# สร้างไฟล์ frontend/.env.local
```

#### 4.3 ตั้งค่า Environment Variables
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3101
```

#### 4.4 รัน Frontend
```bash
# Development mode
npm run dev

# หรือระบุ port
npm run dev -- -p 3011
```

### 5. 🎯 **การรันแบบรวดเร็ว (ใช้ Batch Scripts)**

#### 5.1 รัน Backend และ Frontend พร้อมกัน
```bash
# Windows
restart-system.bat

# หรือรันแยกกัน
cd backend && npm run dev
cd frontend && npm run dev
```

#### 5.2 ตรวจสอบการทำงาน
```bash
# ตรวจสอบ ports
netstat -ano | findstr :3101  # Backend
netstat -ano | findstr :3011  # Frontend
```

### 6. 🔍 **การทดสอบ**

#### 6.1 ทดสอบ Backend API
```bash
# ทดสอบ API endpoints
node test-status-endpoint.js
node test-finish-production.js
node test-frontend-finish.js
```

#### 6.2 ทดสอบ Frontend
- เปิดเบราว์เซอร์ไปที่: `http://localhost:3011`
- หน้า Production Planning: `http://localhost:3011`
- หน้า Tracker: `http://localhost:3011/tracker`

### 7. 🛠️ **การแก้ไขปัญหา**

#### 7.1 ปัญหา Database
```bash
# ตรวจสอบ MySQL service
net start mysql

# ตรวจสอบการเชื่อมต่อ
mysql -u root -p -e "USE workplan; SHOW TABLES;"
```

#### 7.2 ปัญหา Ports
```bash
# ตรวจสอบ ports ที่ใช้งาน
netstat -ano | findstr :3101
netstat -ano | findstr :3011

# Kill process ที่ใช้ port
taskkill /f /pid <PID>
```

#### 7.3 ปัญหา Dependencies
```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

### 8. 📱 **การใช้งาน**

#### 8.1 หน้า Production Planning
- URL: `http://localhost:3011`
- ฟีเจอร์: สร้างงานผลิต, แก้ไขงาน, Sync ไป Google Sheets

#### 8.2 หน้า Tracker
- URL: `http://localhost:3011/tracker`
- ฟีเจอร์: จับเวลาการผลิต, จบงานผลิต

### 9. 🔄 **การ Deploy**

#### 9.1 Development
```bash
# รันในโหมด development
npm run dev
```

#### 9.2 Production
```bash
# Build frontend
cd frontend
npm run build

# รัน backend ด้วย PM2
cd backend
pm2 start ecosystem.config.js
```

### 10. 📞 **การติดต่อ**

หากมีปัญหาในการ setup หรือใช้งาน:
- ตรวจสอบ logs ใน terminal
- ตรวจสอบ database connection
- ตรวจสอบ environment variables

---

## 🎉 **เสร็จสิ้น!**

โปรเจคพร้อมใช้งานแล้ว! 🚀 