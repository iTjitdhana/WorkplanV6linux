# แก้ไขปัญหาการเชื่อมต่อฐานข้อมูล MySQL

## 🚨 ปัญหาที่เกิดขึ้น
```
Database connection failed: Access denied for user 'jitdhana'@'host.docker.internal' (using password: YES)
```

## 🔍 สาเหตุที่เป็นไปได้

1. **MySQL Server ไม่ได้เปิดใช้งาน** บนเครื่อง 192.168.0.94
2. **User 'jitdhana' ไม่มี permission** ในการเชื่อมต่อจาก host อื่น
3. **Password ไม่ถูกต้อง** หรือ authentication method ไม่รองรับ
4. **Port 3306 ถูก block** โดย firewall
5. **MySQL bind-address** ตั้งค่าไม่ถูกต้อง

## 🛠️ วิธีแก้ไข

### ขั้นตอนที่ 1: ตรวจสอบ MySQL Server

```bash
# ตรวจสอบว่า MySQL รันอยู่หรือไม่
sudo systemctl status mysql
# หรือ
sudo service mysql status

# ถ้าไม่รัน ให้เริ่มต้น MySQL
sudo systemctl start mysql
# หรือ
sudo service mysql start
```

### ขั้นตอนที่ 2: ตรวจสอบ MySQL Configuration

แก้ไขไฟล์ `/etc/mysql/mysql.conf.d/mysqld.cnf` (Ubuntu/Debian) หรือ `/etc/my.cnf` (CentOS/RHEL):

```ini
[mysqld]
bind-address = 0.0.0.0
port = 3306
```

จากนั้น restart MySQL:
```bash
sudo systemctl restart mysql
```

### ขั้นตอนที่ 3: แก้ไข User Permissions

เข้า MySQL ด้วย root user:
```bash
mysql -u root -p
```

รันคำสั่ง SQL จากไฟล์ `backend/fix_mysql_user.sql`:
```sql
-- สร้าง user และให้สิทธิ์
CREATE USER IF NOT EXISTS 'jitdhana'@'%' IDENTIFIED BY 'iT123454$';
GRANT ALL PRIVILEGES ON esp_tracker.* TO 'jitdhana'@'%';
FLUSH PRIVILEGES;
```

### ขั้นตอนที่ 4: ตรวจสอบ Firewall

```bash
# Ubuntu/Debian
sudo ufw allow 3306
sudo ufw reload

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3306/tcp
sudo firewall-cmd --reload
```

### ขั้นตอนที่ 5: ทดสอบการเชื่อมต่อ

```bash
# ทดสอบจากเครื่องอื่น
mysql -h 192.168.0.94 -u jitdhana -p esp_tracker

# ทดสอบจาก localhost
mysql -u jitdhana -p esp_tracker
```

## 🚀 วิธีรัน Backend หลังแก้ไข

```bash
cd backend
npm run dev
```

## 📋 การตรวจสอบเพิ่มเติม

### ตรวจสอบ MySQL Users
```sql
SELECT User, Host FROM mysql.user WHERE User = 'jitdhana';
SHOW GRANTS FOR 'jitdhana'@'%';
```

### ตรวจสอบ Database
```sql
SHOW DATABASES;
USE esp_tracker;
SHOW TABLES;
```

### ตรวจสอบ Network Connection
```bash
# ตรวจสอบว่า port 3306 เปิดอยู่หรือไม่
netstat -tlnp | grep 3306
# หรือ
ss -tlnp | grep 3306
# ทดสอบ connection จากเครื่องอื่น
telnet 192.168.0.94 3306
```

## 🔧 Alternative: ใช้ Local MySQL

หากยังแก้ไขไม่ได้ สามารถเปลี่ยนไปใช้ MySQL ในเครื่องเดียวกันกับ Backend:

แก้ไขไฟล์ `backend/config/database.js`:
```javascript
const dbConfig = {
  host: 'localhost', // เปลี่ยนจาก 192.168.0.94
  user: 'root',      // หรือ user ที่มีอยู่
  password: 'your_password',
  database: 'esp_tracker',
  port: 3306
};
```

## 📞 หากยังแก้ไขไม่ได้

ติดต่อแผนกเทคโนโลยีสารสนเทศเพื่อขอความช่วยเหลือในการตั้งค่า MySQL Server 