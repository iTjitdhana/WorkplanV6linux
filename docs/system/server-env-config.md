# Server Environment Configuration

## ปัญหาที่พบ
- Database อยู่ที่ `192.168.0.94`
- Server รันที่ IP อื่น (เช่น `192.168.0.161`)
- เครื่องอื่นเข้าผ่าน IP server ได้ แต่เชื่อม Database ไม่ติด

## เป้าหมาย
- รันระบบที่ IP ไหนก็ได้
- เครื่องอื่นเข้าผ่าน IP server ได้
- เชื่อม Database ที่ `192.168.0.94` ได้

## การแก้ไข

### 1. สร้างไฟล์ .env ใน backend
```bash
# backend/.env
# Database Configuration (เชื่อมต่อ Database ที่ 192.168.0.94)
DB_HOST=192.168.0.94
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=esp_tracker
DB_PORT=3306

# Server Configuration
PORT=3101
NODE_ENV=production
PRODUCTION_HOST=0.0.0.0

# Google Apps Script URL
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# CORS Configuration (ให้เครื่องอื่นเข้าผ่าน IP ได้)
CORS_ORIGIN=*
CORS_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS
CORS_CREDENTIALS=true
```

### 2. แก้ไข Backend Server Configuration
ไฟล์: `backend/server.js`
```javascript
// เพิ่ม CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  credentials: process.env.CORS_CREDENTIALS === 'true'
};

app.use(cors(corsOptions));

// ใช้ 0.0.0.0 เพื่อให้เข้าจาก IP ไหนก็ได้
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const PORT = process.env.PORT || 3101;

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on ${HOST}:${PORT}`);
  console.log(`📊 API Documentation: http://${HOST}:${PORT}/api`);
  console.log(`🌐 Network access: http://${HOST}:${PORT}/api`);
});
```

### 3. แก้ไข Frontend Configuration
ไฟล์: `frontend/.env.local`
```bash
# Frontend Environment
NEXT_PUBLIC_API_URL=http://192.168.0.161:3101
```

### 4. แก้ไข Frontend API Proxy
ไฟล์: `frontend/app/api/**/route.ts`
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.161:3101';
```

## ขั้นตอนการ Deploy

### 1. ตั้งค่า Database
```sql
-- บนเครื่อง Database (192.168.0.94)
-- ให้สิทธิ์ user เชื่อมต่อจาก IP อื่น
GRANT ALL PRIVILEGES ON esp_tracker.* TO 'root'@'%' IDENTIFIED BY 'your_password';
FLUSH PRIVILEGES;

-- ตรวจสอบ MySQL bind address
-- แก้ไขไฟล์ /etc/mysql/mysql.conf.d/mysqld.cnf
-- เปลี่ยน bind-address = 127.0.0.1 เป็น bind-address = 0.0.0.0
-- รีสตาร์ท MySQL: sudo systemctl restart mysql
```

### 2. ตั้งค่า Server
```bash
# บนเครื่อง Server (192.168.0.161)
cd /path/to/WorkplanV6

# สร้างไฟล์ .env
cp server-env-config.md backend/.env
# แก้ไข DB_PASSWORD ให้ตรงกับ MySQL

# ติดตั้ง dependencies
cd backend && npm install
cd ../frontend && npm install

# รันระบบ
cd ..
npm run start:server
```

### 3. ตั้งค่า Firewall
```bash
# บนเครื่อง Server
# เปิด port 3101 และ 3011
sudo ufw allow 3101
sudo ufw allow 3011
```

## การทดสอบ

### 1. ทดสอบ Database Connection
```bash
# บนเครื่อง Server
mysql -h 192.168.0.94 -u root -p esp_tracker
```

### 2. ทดสอบ Backend API
```bash
# จากเครื่องอื่น
curl http://192.168.0.161:3101/api/work-plans/drafts
```

### 3. ทดสอบ Frontend
```bash
# จากเครื่องอื่น
curl http://192.168.0.161:3011
```

## ปัญหาที่อาจเกิดขึ้น

### ปัญหา: Database connection failed
**วิธีแก้:**
1. ตรวจสอบ MySQL user permissions
2. ตรวจสอบ MySQL bind address
3. ตรวจสอบ firewall

### ปัญหา: เครื่องอื่นเข้าไม่ได้
**วิธีแก้:**
1. ตรวจสอบ server bind address (0.0.0.0)
2. ตรวจสอบ firewall
3. ตรวจสอบ CORS configuration

### ปัญหา: Frontend ไม่เชื่อม Backend
**วิธีแก้:**
1. ตรวจสอบ NEXT_PUBLIC_API_URL
2. ตรวจสอบ API proxy configuration
3. ตรวจสอบ network connectivity 