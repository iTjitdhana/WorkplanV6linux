# 🚀 คู่มือการ Deploy ระบบ WorkplansV4 แบบรวดเร็ว

## 📋 สิ่งที่ต้องเตรียม

### สำหรับ Linux/Ubuntu Server:
1. **Server** ที่มี Ubuntu 18.04+ หรือ CentOS 7+
2. **Domain** (ถ้ามี) หรือใช้ IP Address
3. **SSH Access** ไปยัง server

### สำหรับ Windows Server:
1. **Windows Server** 2016+ หรือ Windows 10/11
2. **Node.js 18+** (ดาวน์โหลดจาก https://nodejs.org/)
3. **MySQL** (ดาวน์โหลดจาก https://dev.mysql.com/downloads/mysql/)

## 🎯 วิธี Deploy แบบรวดเร็ว

### ตัวเลือกที่ 1: ใช้ Auto Script (แนะนำ)

#### สำหรับ Linux/Ubuntu:
```bash
# 1. Clone โปรเจค
git clone https://github.com/iTjitdhana/WorkplansV4.git
cd WorkplansV4

# 2. ให้สิทธิ์และรัน script
chmod +x deploy.sh
./deploy.sh
```

#### สำหรับ Windows:
```cmd
# 1. Clone โปรเจค
git clone https://github.com/iTjitdhana/WorkplansV4.git
cd WorkplansV4

# 2. รัน script
deploy.bat
```

### ตัวเลือกที่ 2: Deploy แบบ Manual

#### ขั้นตอนที่ 1: เตรียม Server
```bash
# อัพเดทระบบ
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ติดตั้ง MySQL
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql

# ติดตั้ง PM2
sudo npm install -g pm2
```

#### ขั้นตอนที่ 2: Clone และตั้งค่า
```bash
# Clone โปรเจค
git clone https://github.com/iTjitdhana/WorkplansV4.git
cd WorkplansV4

# ตั้งค่าฐานข้อมูล
sudo mysql
CREATE DATABASE esp_tracker;
exit

# Import ฐานข้อมูล
mysql -u root -p esp_tracker < backend/esp_tracker\ \(6\).sql
```

#### ขั้นตอนที่ 3: ตั้งค่า Backend
```bash
cd backend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env
cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=esp_tracker
DB_PORT=3306
PORT=3101
NODE_ENV=production
FRONTEND_URL=http://your_server_ip:3011
API_RATE_LIMIT=1000
EOF

cd ..
```

#### ขั้นตอนที่ 4: ตั้งค่า Frontend
```bash
cd frontend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://your_server_ip:3101
EOF

# Build สำหรับ production
npm run build

cd ..
```

#### ขั้นตอนที่ 5: ตั้งค่า PM2
```bash
# สร้าง ecosystem config
cat > ecosystem.config.js << EOF
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
EOF

# Start ระบบ
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### ขั้นตอนที่ 6: ตั้งค่า Firewall
```bash
# เปิด port ที่จำเป็น
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3011  # Frontend
sudo ufw allow 3101  # Backend
sudo ufw enable
```

## 🌐 การเข้าถึงระบบ

หลังจาก deploy เสร็จแล้ว สามารถเข้าถึงระบบได้ที่:

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

## 🐛 การแก้ไขปัญหาเบื้องต้น

### ปัญหา: Database Connection Failed
```bash
# ตรวจสอบ MySQL
sudo systemctl status mysql

# ตรวจสอบ .env file
cat backend/.env

# ทดสอบการเชื่อมต่อ
mysql -u root -p -e "SHOW DATABASES;"
```

### ปัญหา: Port ถูกใช้งาน
```bash
# ดู process ที่ใช้ port
sudo netstat -tlnp | grep :3101
sudo netstat -tlnp | grep :3011

# Kill process
sudo kill -9 <PID>
```

### ปัญหา: PM2 ไม่ทำงาน
```bash
# ตรวจสอบ PM2
pm2 status

# Restart PM2
pm2 restart all

# ดู logs
pm2 logs
```

## 📊 การ Monitor

### ตรวจสอบสถานะระบบ
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

### ตรวจสอบ Database
```bash
# เข้า MySQL
mysql -u root -p

# ดูฐานข้อมูล
SHOW DATABASES;
USE esp_tracker;
SHOW TABLES;

# ดูข้อมูล
SELECT COUNT(*) FROM work_plans;
SELECT COUNT(*) FROM users;
```

## 🔒 ความปลอดภัย

### ตั้งค่า SSL (ถ้ามี Domain)
```bash
# ติดตั้ง Certbot
sudo apt install certbot python3-certbot-nginx -y

# สร้าง SSL certificate
sudo certbot --nginx -d your-domain.com
```

### ตั้งค่า Firewall เพิ่มเติม
```bash
# เปิดเฉพาะ port ที่จำเป็น
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3011/tcp
sudo ufw allow 3101/tcp

# ปิด port อื่นๆ
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

## 📞 การติดต่อ Support

หากมีปัญหาในการ deploy สามารถติดต่อได้ที่:
- **แผนกเทคโนโลยีสารสนเทศ**
- **บริษัท จิตต์ธนา จำกัด (สำนักงานใหญ่)**

---

## ⚡ Quick Commands Summary

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

**หมายเหตุ**: ระบบนี้เหมาะสำหรับการใช้งานภายในองค์กร หากต้องการ deploy บน cloud platform ให้ดูใน `SERVER_DEPLOYMENT_GUIDE.md` 