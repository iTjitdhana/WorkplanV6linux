# 🚀 Production Deployment Guide

## 📋 ขั้นตอนการ Deploy Production

### 1. การเตรียมระบบ

#### ✅ **ความต้องการระบบ:**
- Node.js (v16 หรือสูงกว่า)
- npm (v8 หรือสูงกว่า)
- MySQL Server (v8.0 หรือสูงกว่า)
- Windows 10/11 หรือ Windows Server

#### ✅ **การตรวจสอบระบบ:**
```powershell
# ตรวจสอบ Node.js
node --version

# ตรวจสอบ npm
npm --version

# ตรวจสอบ MySQL
mysql --version
```

### 2. การ Deploy แบบอัตโนมัติ

#### 🚀 **วิธีที่ 1: Deploy ครบทุกขั้นตอน**
```powershell
.\deploy-production.ps1
```

#### ⚡ **วิธีที่ 2: เริ่มเซิร์ฟเวอร์เท่านั้น**
```powershell
.\start-production.ps1
```

#### 🛑 **หยุดเซิร์ฟเวอร์**
```powershell
.\stop-production.ps1
```

### 3. การ Deploy แบบ Manual

#### **Step 1: ตั้งค่า Environment Variables**

**Backend (.env):**
```env
NODE_ENV=production
PORT=3101
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=esp_tracker
DB_PORT=3306
API_RATE_LIMIT=1000
FRONTEND_URL=http://localhost:3011
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3101
NODE_ENV=production
```

#### **Step 2: Install Dependencies**
```powershell
# Backend
cd backend
npm install --production

# Frontend
cd ../frontend
npm install
```

#### **Step 3: Build Frontend**
```powershell
cd frontend
npm run build
```

#### **Step 4: Database Setup**
```sql
-- เพิ่ม Indexes เพื่อประสิทธิภาพ
mysql -u root -p < optimize-database-indexes.sql
```

#### **Step 5: Start Servers**
```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🌐 การเข้าถึงระบบ

### **URLs:**
- **Frontend**: http://localhost:3011
- **Backend API**: http://localhost:3101

### **API Endpoints:**
- Work Plans: http://localhost:3101/api/work-plans
- Users: http://localhost:3101/api/users
- Reports: http://localhost:3101/api/reports

## 🔧 การตั้งค่า Production

### **1. Database Configuration**
```sql
-- สร้างผู้ใช้สำหรับ Production
CREATE USER 'production_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON esp_tracker.* TO 'production_user'@'localhost';
FLUSH PRIVILEGES;
```

### **2. Security Settings**
- เปลี่ยนรหัสผ่าน Database
- ตั้งค่า Firewall
- ใช้ HTTPS (ถ้าต้องการ)

### **3. Performance Optimization**
```sql
-- เพิ่ม Indexes
CREATE INDEX idx_work_plans_production_date ON work_plans(production_date);
CREATE INDEX idx_work_plans_job_code ON work_plans(job_code);
CREATE INDEX idx_work_plans_status_id ON work_plans(status_id);
```

## 📊 การติดตามระบบ

### **1. Performance Monitoring**
```powershell
# รันการทดสอบประสิทธิภาพ
.\performance-test.ps1
```

### **2. Log Monitoring**
- Backend logs: console output
- Frontend logs: browser console
- Database logs: MySQL error log

### **3. Health Check**
```powershell
# ตรวจสอบสถานะ API
curl http://localhost:3101/api/work-plans

# ตรวจสอบสถานะ Frontend
curl http://localhost:3011
```

## 🛠️ การแก้ไขปัญหา

### **ปัญหา: Port ถูกใช้งานแล้ว**
```powershell
# ดู process ที่ใช้ port
netstat -ano | findstr :3101
netstat -ano | findstr :3011

# หยุด process
taskkill /PID <process_id> /F
```

### **ปัญหา: Database ไม่เชื่อมต่อ**
```powershell
# ตรวจสอบ MySQL service
net start mysql

# ทดสอบการเชื่อมต่อ
mysql -u root -p -e "SHOW DATABASES;"
```

### **ปัญหา: Frontend ไม่ build ได้**
```powershell
# ลบ cache และ build ใหม่
cd frontend
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## 🔄 การอัปเดตระบบ

### **1. อัปเดต Code**
```powershell
# หยุดเซิร์ฟเวอร์
.\stop-production.ps1

# อัปเดต code (git pull หรือ copy files)

# Build และเริ่มใหม่
.\deploy-production.ps1
```

### **2. อัปเดต Database**
```sql
-- รัน migration scripts
mysql -u root -p esp_tracker < update_schema.sql
```

## 📈 การ Scale Up

### **1. การเพิ่มประสิทธิภาพ**
- ใช้ PM2 สำหรับ process management
- ใช้ Nginx สำหรับ reverse proxy
- ใช้ Redis สำหรับ caching

### **2. การ Monitor**
- ติดตั้ง monitoring tools
- ตั้งค่า alerts
- สำรองข้อมูลอัตโนมัติ

## 🔐 Security Checklist

- [ ] เปลี่ยนรหัสผ่าน default
- [ ] ตั้งค่า firewall rules
- [ ] อัปเดต dependencies
- [ ] ตั้งค่า HTTPS
- [ ] จำกัดการเข้าถึง database
- [ ] สำรองข้อมูลเป็นประจำ

## 📞 การติดต่อ

หากมีปัญหาในการ deploy:
1. ตรวจสอบ logs ใน console
2. ใช้ performance test เพื่อ debug
3. ตรวจสอบ network connectivity
4. ตรวจสอบ database connection