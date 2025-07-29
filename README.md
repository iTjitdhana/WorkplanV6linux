# 🏭 Workplan Production Management System

ระบบจัดการแผนการผลิตและจับเวลาการทำงาน

## 🚀 **การติดตั้งและรันโปรเจค**

### 📋 **ข้อกำหนดเบื้องต้น**
- Node.js (v16 หรือใหม่กว่า)
- npm หรือ pnpm
- MySQL (v8.0 หรือใหม่กว่า)

### 🔧 **การ Setup หลัง Clone**

#### วิธีที่ 1: ใช้ Batch Script (แนะนำ)
```bash
# Windows
setup-after-clone.bat
```

#### วิธีที่ 2: Setup แบบ Manual

1. **Clone โปรเจค**
```bash
git clone https://github.com/iTjitdhana/WorkplanV5.git
cd WorkplanV5
```

2. **Setup Database**
```sql
CREATE DATABASE workplan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE workplan;
SOURCE backend/fix_database.sql;
```

3. **Setup Backend**
```bash
cd backend
npm install
# สร้างไฟล์ .env และตั้งค่า database
npm run dev
```

4. **Setup Frontend**
```bash
cd frontend
npm install
# สร้างไฟล์ .env.local
npm run dev
```

### 🎯 **การรันโปรเจค**

#### รันแบบรวดเร็ว
```bash
# Windows
restart-system.bat
```

#### รันแยกกัน
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### 🌐 **URLs**
- **Frontend**: http://localhost:3011
- **Backend API**: http://localhost:3101
- **Tracker Page**: http://localhost:3011/tracker

## 📱 **ฟีเจอร์หลัก**

### 🏭 **Production Planning**
- สร้างและจัดการแผนการผลิต
- แก้ไขงานผลิตแบบ Draft
- Sync ข้อมูลไป Google Sheets
- ดูสถานะงานแบบ Daily/Weekly View

### ⏱️ **Production Tracker**
- จับเวลาการผลิตแบบ Real-time
- ติดตามขั้นตอนการผลิต
- จบงานผลิตและอัปเดตสถานะ
- ดูสถิติเวลาการทำงาน

### 📊 **Status Management**
- **รอดำเนินการ**: สีเทา
- **กำลังดำเนินการ**: สีเหลือง
- **เสร็จสิ้น**: สีเขียว
- **ยกเลิกการผลิต**: สีแดง

## 🗄️ **Database Schema**

### ตารางหลัก
- `work_plans` - งานผลิตหลัก
- `work_plan_drafts` - งานผลิตแบบร่าง
- `logs` - บันทึกเวลาการทำงาน
- `users` - ผู้ใช้งาน
- `machines` - เครื่องจักร
- `production_rooms` - ห้องผลิต
- `production_statuses` - สถานะการผลิต

## 🔧 **การพัฒนา**

### โครงสร้างโปรเจค
```
├── frontend/                 # Next.js Frontend
│   ├── app/                 # App Router
│   ├── components/          # React Components
│   └── public/              # Static Files
├── backend/                 # Node.js Backend
│   ├── controllers/         # API Controllers
│   ├── models/             # Database Models
│   ├── routes/             # API Routes
│   └── config/             # Configuration
└── docs/                   # Documentation
```

### API Endpoints
- `GET /api/work-plans` - ดึงงานผลิต
- `POST /api/work-plans` - สร้างงานผลิต
- `PATCH /api/work-plans/:id/status` - อัปเดตสถานะ
- `GET /api/logs` - ดึงบันทึกเวลา
- `POST /api/logs` - สร้างบันทึกเวลา

## 🛠️ **การแก้ไขปัญหา**

### ปัญหาที่พบบ่อย
1. **Database Connection Error**
   - ตรวจสอบ MySQL service
   - ตรวจสอบไฟล์ .env

2. **Port Already in Use**
   - ตรวจสอบ ports 3101, 3011
   - Kill process ที่ใช้ port

3. **Dependencies Error**
   - ลบ node_modules และติดตั้งใหม่
   - ตรวจสอบ Node.js version

### Test Scripts
```bash
# ทดสอบ API endpoints
node test-status-endpoint.js
node test-finish-production.js
node test-frontend-finish.js
```

## 📚 **เอกสารเพิ่มเติม**

- [คู่มือการ Setup](SETUP_AFTER_CLONE.md)
- [การ Deploy](DEPLOYMENT.md)
- [การแก้ไขปัญหา](TROUBLESHOOTING.md)

## 🤝 **การมีส่วนร่วม**

1. Fork โปรเจค
2. สร้าง Feature Branch
3. Commit การเปลี่ยนแปลง
4. Push ไปยัง Branch
5. สร้าง Pull Request

## 📄 **License**

MIT License - ดูรายละเอียดใน [LICENSE](LICENSE) file

---

## 🎉 **เสร็จสิ้น!**

โปรเจคพร้อมใช้งานแล้ว! 🚀 