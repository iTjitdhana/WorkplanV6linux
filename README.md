# 🚀 WorkPlan V6 - Production Tracking System

ระบบติดตามการผลิตแบบ Real-time สำหรับโรงงานอุตสาหกรรม

## 📋 Quick Start

### 🎯 วิธีเริ่มใช้งานง่ายๆ

1. **รันระบบทันที** - ดับเบิลคลิก
   ```
   start-workplan-system.bat
   ```

2. **หรือเลือกโหมด:**
   - `run-production.bat` - สำหรับใช้งานจริง
   - `run-development.bat` - สำหรับพัฒนา

## 🌐 เข้าใช้งาน

- **Frontend**: http://localhost:3012
- **Backend API**: http://localhost:3102

## 📁 โครงสร้างไฟล์

```
WorkPlanV6/
├── 📱 frontend/          # Next.js Frontend
├── 🔧 backend/           # Node.js Backend  
├── 🗄️ database/          # Database Scripts
├── 📚 docs/              # Documentation
├── 🛠️ tools/             # Development Tools
├── 📜 scripts/           # Build & Utility Scripts
├── 🚀 deployment/        # Deployment Files & Scripts
│   ├── linux/           # Linux deployment files
│   ├── windows/         # Windows deployment files
│   ├── guides/          # Deployment guides
│   └── scripts/         # Additional scripts
│
├── 🚀 start-workplan-system.bat  # Main Launcher
├── 🏭 run-production.bat         # Production Mode
├── 🔧 run-development.bat        # Development Mode
└── 📄 README.md                  # This file
```

## ⚡ Features

- **Real-time Production Tracking** - ติดตามการผลิตแบบ Real-time
- **Work Plan Management** - จัดการแผนงานการผลิต
- **Machine Status Monitoring** - ตรวจสอบสถานะเครื่องจักร
- **Production Logs** - บันทึกข้อมูลการผลิต
- **Reports & Analytics** - รายงานและวิเคราะห์ข้อมูล
- **User Management** - จัดการผู้ใช้งาน
- **Thai Buddhist Calendar** - ปฏิทินไทย พ.ศ.
- **Performance Optimized** - เร็วขึ้น 70%

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework  
- **MySQL** - Database
- **JWT** - Authentication

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React-Select** - Advanced dropdowns
- **React-Day-Picker** - Calendar component

## 📊 System Requirements

- **Node.js 18+**
- **MySQL 8.0+**
- **Windows 10/11** (สำหรับ .bat scripts)

## 🔧 Manual Setup (ถ้าต้องการ)

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend  
```bash
cd frontend
npm install
npm run build
npm start
```

## 📈 Performance Improvements

- **Database Indexes** - เร็วขึ้น 83%
- **Pagination** - โหลดข้อมูลทีละส่วน
- **Caching** - Cache ข้อมูลที่ไม่เปลี่ยนบ่อย
- **Virtual Scrolling** - แสดงข้อมูลได้ไม่จำกัด
- **Background Loading** - โหลดข้อมูลย้อนหลัง 30 วัน

## 🐛 Troubleshooting

### ปัญหาที่พบบ่อย

1. **Port Already in Use**
   ```bash
   netstat -an | findstr :3012
   netstat -an | findstr :3102
   ```

2. **Database Connection Failed**
   - ตรวจสอบ MySQL server
   - ตรวจสอบ credentials ใน `.env`

3. **Frontend Build Failed**
   ```bash
   cd frontend
   rm -rf .next
   npm install
   ```

## 📞 Support

- **แผนกเทคโนโลยีสารสนเทศ**
- **บริษัท จิตต์ธนา จำกัด (สำนักงานใหญ่)**

---

## 🎉 Version 6.0 Features

- ✅ **Performance Optimization** - เร็วขึ้น 70%
- ✅ **Thai Buddhist Calendar** - ปฏิทินไทย พ.ศ.
- ✅ **Advanced Search** - ค้นหาและเพิ่มงานใหม่
- ✅ **Better UI/UX** - Interface ที่สวยขึ้น
- ✅ **Error Handling** - จัดการ error ที่ดีขึ้น
- ✅ **Code Quality** - Type safety และ clean code




