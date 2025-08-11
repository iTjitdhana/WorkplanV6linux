# 🚀 คู่มือการ Deploy ระบบ WorkplansV4 ไปยัง Server

## 📋 ภาพรวมระบบ
- **Backend**: Node.js + Express.js (Port 3101)
- **Frontend**: Next.js (Port 3011) 
- **Database**: MySQL
- **Process Manager**: PM2

## 🎯 ตัวเลือกการ Deploy

### ตัวเลือกที่ 1: Deploy ทั้งระบบบน Server เดียวกัน (แนะนำ)

#### ขั้นตอนที่ 1: เตรียม Server
```bash
# อัพเดทระบบ
sudo apt update && sudo apt upgrade -y

# ติดตั้ง Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# ติดตั้ง MySQL
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql

# ติดตั้ง PM2
sudo npm install -g pm2

# ติดตั้ง Git
sudo apt install git -y
```

#### ขั้นตอนที่ 2: Clone โปรเจค
```bash
git clone https://github.com/iTjitdhana/WorkplansV4.git
cd WorkplansV4
```

#### ขั้นตอนที่ 3: ตั้งค่าฐานข้อมูล
```bash
# เข้า MySQL
sudo mysql

# สร้างฐานข้อมูล
CREATE DATABASE esp_tracker;
USE esp_tracker;

# ออกจาก MySQL
exit

# Import ฐานข้อมูล
mysql -u root -p esp_tracker < backend/esp_tracker\ \(6\).sql
```

#### ขั้นตอนที่ 4: ตั้งค่า Backend
```bash
cd backend

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

# ติดตั้ง dependencies
npm install

# ทดสอบการเชื่อมต่อ
npm run dev
```

#### ขั้นตอนที่ 5: ตั้งค่า Frontend
```bash
cd ../frontend

# สร้างไฟล์ .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://your_server_ip:3101
EOF

# ติดตั้ง dependencies
npm install

# Build สำหรับ production
npm run build
```

#### ขั้นตอนที่ 6: ตั้งค่า PM2
```bash
# สร้าง ecosystem config สำหรับทั้งระบบ
cd ..
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

# Start ทั้งระบบ
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### ขั้นตอนที่ 7: ตั้งค่า Firewall
```bash
# เปิด port ที่จำเป็น
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3011  # Frontend
sudo ufw allow 3101  # Backend
sudo ufw enable
```

### ตัวเลือกที่ 2: ใช้ Docker (สำหรับผู้ที่มีประสบการณ์)

#### สร้าง Dockerfile สำหรับ Backend
```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3101
CMD ["npm", "start"]
```

#### สร้าง Dockerfile สำหรับ Frontend
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3011
CMD ["node", "server.js"]
```

#### สร้าง docker-compose.yml
```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: your_password
      MYSQL_DATABASE: esp_tracker
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/esp_tracker\ \(6\).sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    ports:
      - "3101:3101"
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: your_password
      DB_NAME: esp_tracker
      NODE_ENV: production
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "3011:3011"
    environment:
      NEXT_PUBLIC_API_URL: http://your_server_ip:3101
    depends_on:
      - backend

volumes:
  mysql_data:
```

### ตัวเลือกที่ 3: ใช้ Cloud Platform

#### Vercel (Frontend) + Railway/Render (Backend)

**Frontend บน Vercel:**
1. Push code ไป GitHub
2. เชื่อมต่อ Vercel กับ GitHub repo
3. ตั้งค่า Environment Variables
4. Deploy อัตโนมัติ

**Backend บน Railway:**
1. Push code ไป GitHub
2. เชื่อมต่อ Railway กับ GitHub repo
3. ตั้งค่า Environment Variables
4. Deploy อัตโนมัติ

## 🔧 การตั้งค่าสำหรับ Production

### 1. ตั้งค่า Domain และ SSL
```bash
# ติดตั้ง Certbot สำหรับ SSL
sudo apt install certbot python3-certbot-nginx -y

# สร้าง SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 2. ตั้งค่า Nginx Reverse Proxy
```bash
# ติดตั้ง Nginx
sudo apt install nginx -y

# สร้าง config
sudo nano /etc/nginx/sites-available/workplans
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3101;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/workplans /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. ตั้งค่า Database Backup
```bash
# สร้าง script backup
cat > /home/backup_db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/backups"
mkdir -p $BACKUP_DIR
mysqldump -u root -p esp_tracker > $BACKUP_DIR/esp_tracker_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
EOF

chmod +x /home/backup_db.sh

# ตั้งค่า cron job (backup ทุกวันเวลา 2:00 AM)
crontab -e
# เพิ่มบรรทัดนี้:
# 0 2 * * * /home/backup_db.sh
```

## 📊 การ Monitor และ Maintenance

### 1. ตรวจสอบสถานะระบบ
```bash
# ดู PM2 status
pm2 status

# ดู logs
pm2 logs

# ดูการใช้ทรัพยากร
pm2 monit
```

### 2. การ Restart ระบบ
```bash
# Restart ทั้งระบบ
pm2 restart all

# Restart เฉพาะ backend
pm2 restart workplans-backend

# Restart เฉพาะ frontend
pm2 restart workplans-frontend
```

### 3. การอัพเดท Code
```bash
# Pull code ใหม่
git pull origin main

# ติดตั้ง dependencies ใหม่
cd backend && npm install
cd ../frontend && npm install

# Build frontend ใหม่
cd frontend && npm run build

# Restart ระบบ
pm2 restart all
```

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. Database Connection Failed
```bash
# ตรวจสอบ MySQL service
sudo systemctl status mysql

# ตรวจสอบ MySQL connection
mysql -u root -p -e "SHOW DATABASES;"

# ตรวจสอบ .env file
cat backend/.env
```

#### 2. Port ถูกใช้งาน
```bash
# ดู process ที่ใช้ port
sudo netstat -tlnp | grep :3101
sudo netstat -tlnp | grep :3011

# Kill process ที่ไม่ต้องการ
sudo kill -9 <PID>
```

#### 3. Memory ไม่พอ
```bash
# ดูการใช้ memory
free -h

# เพิ่ม swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📞 การติดต่อและ Support

หากมีปัญหาในการ deploy สามารถติดต่อได้ที่:
- แผนกเทคโนโลยีสารสนเทศ
- บริษัท จิตต์ธนา จำกัด (สำนักงานใหญ่)

---

**หมายเหตุ**: คู่มือนี้ครอบคลุมการ deploy ทั้งระบบบน server เดียวกัน ซึ่งเหมาะสำหรับการใช้งานภายในองค์กร หากต้องการ deploy บน cloud platform หรือใช้ Docker ให้ดูในส่วนที่เกี่ยวข้อง 