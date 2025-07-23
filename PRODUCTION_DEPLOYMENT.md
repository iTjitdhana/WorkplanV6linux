# การติดตั้งบน Production Server

## 🚀 คำแนะนำสำหรับการติดตั้งบน Server

### ปัญหาที่พบ
- รันได้บน localhost แต่พอขึ้น server แล้วเชื่อมต่อฐานข้อมูลไม่ได้
- Error: `Access denied for user 'jitdhana'@'host.docker.internal'`

### สาเหตุหลัก
1. **Database Configuration**: ใช้ค่า config สำหรับ development บน production
2. **MySQL User Permissions**: User ไม่มีสิทธิ์เชื่อมต่อจาก server
3. **Network Configuration**: MySQL ไม่เปิดให้เชื่อมต่อจากภายนอก
4. **Environment Variables**: ไม่ได้ตั้งค่า environment สำหรับ production

## 🛠️ วิธีแก้ไข

### ขั้นตอนที่ 1: Clone และเข้าไปในโฟลเดอร์
```bash
git clone https://github.com/iTjitdhana/WorkplansV4.git
cd WorkplansV4/backend
```

### ขั้นตอนที่ 2: รัน Production Setup Script (แนะนำ)
```bash
chmod +x setup_production.sh
./setup_production.sh
```

Script นี้จะทำการ:
- ติดตั้ง MySQL (ถ้ายังไม่มี)
- สร้างฐานข้อมูล `esp_tracker`
- Import database schema
- สร้างไฟล์ `.env` สำหรับ production
- ติดตั้ง Node.js dependencies
- ติดตั้งและตั้งค่า PM2
- ทดสอบการเชื่อมต่อฐานข้อมูล

### ขั้นตอนที่ 3: Manual Setup (ถ้าไม่ใช้ script)

#### 3.1 ติดตั้ง MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server -y

# CentOS/RHEL
sudo yum install mysql-server -y

# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### 3.2 สร้างฐานข้อมูลและ User
```bash
mysql -u root -p
```

```sql
-- สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS esp_tracker;

-- ใช้ root user สำหรับ production (ปลอดภัยกว่า)
GRANT ALL PRIVILEGES ON esp_tracker.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

-- ตรวจสอบ
SHOW DATABASES;
USE esp_tracker;
```

#### 3.3 Import Database Schema
```bash
# หา SQL file
find . -name "*.sql" -type f

# Import schema
mysql -u root -p esp_tracker < "esp_tracker (6).sql"
```

#### 3.4 สร้างไฟล์ .env
```bash
cd backend
nano .env
```

เพิ่มเนื้อหา:
```env
# Production Environment Variables
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=esp_tracker
DB_PORT=3306

# Server Configuration
PORT=3101
NODE_ENV=production

# Frontend URL for CORS
FRONTEND_URL=http://192.168.0.94:3011

# API Rate Limit
API_RATE_LIMIT=1000
```

#### 3.5 ติดตั้ง Dependencies
```bash
npm install
```

#### 3.6 ทดสอบการเชื่อมต่อ
```bash
npm run dev
```

ดูว่ามี message:
```
✅ Database connected successfully
🏠 Connected to host: localhost
👤 Connected as user: root
```

### ขั้นตอนที่ 4: ติดตั้ง PM2 สำหรับ Production
```bash
# ติดตั้ง PM2
sudo npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Enable PM2 to start on boot
pm2 startup
```

### ขั้นตอนที่ 5: ตั้งค่า Firewall
```bash
# เปิด port 3101 สำหรับ Backend API
sudo ufw allow 3101

# เปิด port 3011 สำหรับ Frontend (ถ้าจำเป็น)
sudo ufw allow 3011

# เปิด port 3306 สำหรับ MySQL (ถ้าจำเป็น)
sudo ufw allow 3306

# ตรวจสอบ firewall status
sudo ufw status
```

## 🧪 การทดสอบ

### ทดสอบ Backend API
```bash
curl http://192.168.0.94:3101/api/health
```

### ทดสอบการเชื่อมต่อฐานข้อมูล
```bash
mysql -u root -p -e "USE esp_tracker; SHOW TABLES;"
```

### ตรวจสอบ PM2 Status
```bash
pm2 status
pm2 logs
```

## 🔧 การจัดการ Application

### PM2 Commands
```bash
# ดู status
pm2 status

# ดู logs
pm2 logs esp-tracker-backend

# Restart
pm2 restart esp-tracker-backend

# Stop
pm2 stop esp-tracker-backend

# Delete
pm2 delete esp-tracker-backend
```

### การอัพเดท Code
```bash
# Pull latest code
git pull origin main

# Install new dependencies
npm install

# Restart application
pm2 restart esp-tracker-backend
```

## 🐛 การแก้ไขปัญหา

### ถ้ายัง Connection ไม่ได้
1. ตรวจสอบ MySQL service: `sudo systemctl status mysql`
2. ตรวจสอบ port: `netstat -tlnp | grep 3306`
3. ตรวจสอบ .env file: `cat .env`
4. ดู logs: `pm2 logs`

### ถ้า Frontend เชื่อมต่อ Backend ไม่ได้
1. ตรวจสอบ Backend รันอยู่: `pm2 status`
2. ทดสอบ API: `curl http://192.168.0.94:3101/api/health`
3. ตรวจสอบ CORS settings ใน `backend/server.js`
4. ตรวจสอบ firewall: `sudo ufw status`

## 📝 หมายเหตุ

- **ความปลอดภัย**: ใช้ root user เฉพาะใน development เท่านั้น สำหรับ production ควรสร้าง user เฉพาะ
- **Backup**: สำรองฐานข้อมูลเป็นประจำ
- **Monitoring**: ใช้ PM2 monitoring หรือติดตั้ง monitoring tools เพิ่มเติม
- **SSL**: พิจารณาใช้ HTTPS สำหรับ production

## 🆘 หากยังมีปัญหา

ติดต่อแผนกเทคโนโลยีสารสนเทศ หรือส่ง logs มาดู:
```bash
pm2 logs --lines 50
``` 