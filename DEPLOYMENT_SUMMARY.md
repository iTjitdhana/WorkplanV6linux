# 🚀 สรุปการ Deploy ระบบ WorkplansV4

## 📋 ภาพรวมระบบ
- **Backend**: Node.js + Express.js (Port 3101)
- **Frontend**: Next.js (Port 3011)
- **Database**: MySQL
- **Process Manager**: PM2

## 🎯 วิธี Deploy ที่แนะนำ

### สำหรับ Linux/Ubuntu Server:

#### วิธีที่ 1: ใช้ Auto Script (ง่ายที่สุด)
```bash
# 1. Clone โปรเจค
git clone https://github.com/iTjitdhana/WorkplansV4.git
cd WorkplansV4

# 2. รัน script อัตโนมัติ
chmod +x deploy.sh
./deploy.sh
```

#### วิธีที่ 2: Deploy แบบ Manual
```bash
# 1. เตรียม Server
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server
sudo npm install -g pm2

# 2. Clone โปรเจค
git clone https://github.com/iTjitdhana/WorkplansV4.git
cd WorkplansV4

# 3. ตั้งค่าฐานข้อมูล
sudo mysql
CREATE DATABASE esp_tracker;
exit
mysql -u root -p esp_tracker < backend/esp_tracker\ \(6\).sql

# 4. ตั้งค่า Backend
cd backend
npm install
# สร้างไฟล์ .env (ดูตัวอย่างด้านล่าง)
cd ..

# 5. ตั้งค่า Frontend
cd frontend
npm install
# สร้างไฟล์ .env.local (ดูตัวอย่างด้านล่าง)
npm run build
cd ..

# 6. ตั้งค่า PM2
# สร้างไฟล์ ecosystem.config.js (ดูตัวอย่างด้านล่าง)
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 7. ตั้งค่า Firewall
sudo ufw allow 22 80 443 3011 3101
sudo ufw enable
```

### สำหรับ Windows Server:

#### วิธีที่ 1: ใช้ Auto Script
```cmd
# 1. Clone โปรเจค
git clone https://github.com/iTjitdhana/WorkplansV4.git
cd WorkplansV4

# 2. รัน script อัตโนมัติ
deploy.bat
```

#### วิธีที่ 2: Deploy แบบ Manual
```cmd
# 1. ติดตั้ง Node.js และ MySQL ก่อน
# ดาวน์โหลดจาก https://nodejs.org/ และ https://dev.mysql.com/downloads/mysql/

# 2. Clone โปรเจค
git clone https://github.com/iTjitdhana/WorkplansV4.git
cd WorkplansV4

# 3. ตั้งค่า Backend
cd backend
npm install
# สร้างไฟล์ .env (ดูตัวอย่างด้านล่าง)
cd ..

# 4. ตั้งค่า Frontend
cd frontend
npm install
# สร้างไฟล์ .env.local (ดูตัวอย่างด้านล่าง)
npm run build
cd ..

# 5. ติดตั้ง PM2
npm install -g pm2

# 6. ตั้งค่า PM2
# สร้างไฟล์ ecosystem.config.js (ดูตัวอย่างด้านล่าง)
pm2 start ecosystem.config.js
pm2 save
```

## 📝 ไฟล์ Configuration ที่สำคัญ

### 1. Backend (.env)
```env
# Production Environment Variables
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=esp_tracker
DB_PORT=3306
PORT=3101
NODE_ENV=production
FRONTEND_URL=http://your_server_ip:3011
API_RATE_LIMIT=1000
```

### 2. Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://your_server_ip:3101
```

### 3. PM2 Ecosystem (ecosystem.config.js)
```javascript
module.exports = {
  apps: [
    {
      name: 'workplans-backend',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3101
      }
    },
    {
      name: 'workplans-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3011
      }
    }
  ]
}
```

## 🌐 การเข้าถึงระบบ

หลังจาก deploy เสร็จแล้ว:

- **หน้าหลัก**: http://your_server_ip:3011
- **หน้า Tracker**: http://your_server_ip:3011/tracker
- **Backend API**: http://your_server_ip:3101

## 🔧 การจัดการระบบ

### คำสั่งพื้นฐาน
```bash
# ดูสถานะ
pm2 status

# ดู logs
pm2 logs

# Restart ทั้งระบบ
pm2 restart all

# Stop ทั้งระบบ
pm2 stop all

# ดูการใช้ทรัพยากร
pm2 monit
```

### การอัพเดทระบบ
```bash
# Pull code ใหม่
git pull origin main

# ติดตั้ง dependencies ใหม่
cd backend && npm install
cd ../frontend && npm install && npm run build

# Restart ระบบ
pm2 restart all
```

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย:

1. **Database Connection Failed**
   ```bash
   # ตรวจสอบ MySQL
   sudo systemctl status mysql
   
   # ตรวจสอบ .env file
   cat backend/.env
   ```

2. **Port ถูกใช้งาน**
   ```bash
   # ดู process ที่ใช้ port
   sudo netstat -tlnp | grep :3101
   sudo netstat -tlnp | grep :3011
   ```

3. **PM2 ไม่ทำงาน**
   ```bash
   # ตรวจสอบ PM2
   pm2 status
   pm2 logs
   ```

## 📊 การ Monitor

```bash
# ดูสถานะทั้งหมด
pm2 status

# ดู logs แบบ real-time
pm2 logs --lines 50

# ดูการใช้ทรัพยากร
pm2 monit

# ดูข้อมูล process
pm2 show workplans-backend
pm2 show workplans-frontend
```

## 🔒 ความปลอดภัย

### ตั้งค่า SSL (ถ้ามี Domain)
```bash
# ติดตั้ง Certbot
sudo apt install certbot python3-certbot-nginx -y

# สร้าง SSL certificate
sudo certbot --nginx -d your-domain.com
```

### ตั้งค่า Firewall
```bash
# เปิดเฉพาะ port ที่จำเป็น
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3011/tcp
sudo ufw allow 3101/tcp
```

## 📞 การติดต่อ Support

หากมีปัญหาในการ deploy สามารถติดต่อได้ที่:
- **แผนกเทคโนโลยีสารสนเทศ**
- **บริษัท จิตต์ธนา จำกัด (สำนักงานใหญ่)**

---

## ⚡ Quick Reference

### สำหรับ Linux:
```bash
# Deploy อัตโนมัติ
git clone https://github.com/iTjitdhana/WorkplansV4.git
cd WorkplansV4
chmod +x deploy.sh
./deploy.sh

# จัดการระบบ
pm2 status          # ดูสถานะ
pm2 logs            # ดู logs
pm2 restart all     # restart ทั้งหมด
pm2 stop all        # หยุดทั้งหมด
```

### สำหรับ Windows:
```cmd
# Deploy อัตโนมัติ
git clone https://github.com/iTjitdhana/WorkplansV4.git
cd WorkplansV4
deploy.bat

# จัดการระบบ
pm2 status          # ดูสถานะ
pm2 logs            # ดู logs
pm2 restart all     # restart ทั้งหมด
pm2 stop all        # หยุดทั้งหมด
```

**หมายเหตุ**: 
- ระบบนี้เหมาะสำหรับการใช้งานภายในองค์กร
- หากต้องการ deploy บน cloud platform ให้ดูใน `SERVER_DEPLOYMENT_GUIDE.md`
- สำหรับรายละเอียดเพิ่มเติมให้ดูใน `QUICK_DEPLOYMENT_GUIDE.md` 