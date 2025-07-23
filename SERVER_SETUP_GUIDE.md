# คู่มือแก้ไขปัญหาการรันบน Server

## 🚨 ปัญหาปัจจุบัน
ระบบรันใน development mode และพยายามเชื่อมต่อไปยัง `192.168.0.94` แต่บน server ควรเชื่อมต่อ `localhost`

## ✅ วิธีแก้ไขด่วน

### ขั้นตอนที่ 1: ตั้งค่า Environment สำหรับ Production
```bash
cd backend
chmod +x set_production_env.sh
./set_production_env.sh
```

### ขั้นตอนที่ 2: แก้ไขรหัสผ่าน MySQL
```bash
nano .env
```

แก้ไขบรรทัด:
```env
DB_PASSWORD=your_mysql_root_password_here
```

### ขั้นตอนที่ 3: ทดสอบการเชื่อมต่อ MySQL
```bash
mysql -u root -p -e "SHOW DATABASES;"
```

### ขั้นตอนที่ 4: สร้างฐานข้อมูล (ถ้ายังไม่มี)
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS esp_tracker;"
```

### ขั้นตอนที่ 5: Import Database Schema
```bash
# หาไฟล์ SQL
find . -name "*.sql" -type f

# Import schema (เลือกไฟล์ที่ถูกต้อง)
mysql -u root -p esp_tracker < "esp_tracker (6).sql"
```

### ขั้นตอนที่ 6: รัน Server ใน Production Mode
```bash
NODE_ENV=production npm start
```

## 🔍 ตรวจสอบผลลัพธ์

ควรเห็น output แบบนี้:
```
🔧 Database Configuration:
   Environment: production
   Host: localhost
   User: root
   Database: esp_tracker
   Port: 3306
   Is Development: false
   Is Localhost: true

🔍 Testing database connection...
✅ Database connected successfully
🏠 Connected to host: localhost
👤 Connected as user: root
🧪 Database query test: PASSED
```

## 🐛 หากยังมีปัญหา

### ปัญหา: MySQL ไม่รัน
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
sudo systemctl status mysql
```

### ปัญหา: ฐานข้อมูลไม่มี
```bash
mysql -u root -p -e "CREATE DATABASE esp_tracker;"
mysql -u root -p -e "SHOW DATABASES;"
```

### ปัญหา: Permission Denied
```bash
mysql -u root -p -e "GRANT ALL PRIVILEGES ON esp_tracker.* TO 'root'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

### ปัญหา: Port ถูกใช้งาน
```bash
sudo netstat -tlnp | grep 3101
sudo lsof -i :3101
```

## 🚀 การรันแบบ Production (PM2)

```bash
# ติดตั้ง PM2
sudo npm install -g pm2

# รัน application
pm2 start ecosystem.config.js --env production

# ดู status
pm2 status

# ดู logs
pm2 logs
```

## 📞 ติดต่อช่วยเหลือ

หากยังแก้ไขไม่ได้ ส่ง logs มาดู:
```bash
NODE_ENV=production npm start 2>&1 | head -20
``` 