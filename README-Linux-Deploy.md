# 🐧 WorkplanV6 Linux Deployment Guide

คู่มือการ Deploy ระบบ WorkplanV6 บน Linux Server (192.168.0.96)

## 📋 ข้อกำหนดเบื้องต้น

- **Linux Server**: Ubuntu 20.04+ หรือ Debian 10+
- **RAM**: อย่างน้อย 4GB
- **Storage**: อย่างน้อย 20GB
- **Network**: เชื่อมต่อกับ Database Server (192.168.0.94)

## 🚀 วิธีการ Deploy

### 1. อัพโหลดไฟล์ไปยัง Linux Server

```bash
# สร้าง directory สำหรับโปรเจค
mkdir -p /opt/workplanv6
cd /opt/workplanv6

# อัพโหลดไฟล์ทั้งหมดจาก Windows machine
# ใช้ scp, rsync, หรือ file transfer tool
```

### 2. ติดตั้ง Docker (ถ้ายังไม่มี)

```bash
# รัน script ติดตั้ง Docker
chmod +x install-docker.sh
./install-docker.sh

# logout และ login ใหม่
exit
# login ใหม่
```

### 3. Deploy ระบบ

```bash
# รัน deployment script
chmod +x deploy-linux.sh
./deploy-linux.sh
```

## 🔧 การตั้งค่า

### Environment Variables

ระบบจะใช้ค่า default ดังนี้:
- **Frontend**: http://192.168.0.96:3012
- **Backend**: http://192.168.0.96:3102
- **Database**: 192.168.0.94:3306

### การปรับแต่ง

แก้ไขไฟล์ `docker-compose.linux.yml` หากต้องการเปลี่ยน:
- Port numbers
- Database connection
- Environment variables

## 📊 การตรวจสอบระบบ

### ดู Status

```bash
# ดู status containers
docker-compose -f docker-compose.linux.yml ps

# ดู logs
docker-compose -f docker-compose.linux.yml logs -f

# ดู logs เฉพาะ service
docker-compose -f docker-compose.linux.yml logs -f frontend
docker-compose -f docker-compose.linux.yml logs -f backend
```

### ตรวจสอบการเชื่อมต่อ

```bash
# ตรวจสอบ port
netstat -tlnp | grep :3012
netstat -tlnp | grep :3102

# ทดสอบ API
curl http://192.168.0.96:3102/api/health
```

## 🛠️ การบำรุงรักษา

### Restart ระบบ

```bash
# Restart ทั้งหมด
docker-compose -f docker-compose.linux.yml restart

# Restart เฉพาะ service
docker-compose -f docker-compose.linux.yml restart frontend
docker-compose -f docker-compose.linux.yml restart backend
```

### Update ระบบ

```bash
# Pull code ใหม่
git pull origin main

# Rebuild และ restart
docker-compose -f docker-compose.linux.yml up --build -d
```

### Backup

```bash
# Backup database (รันบน database server)
mysqldump -h 192.168.0.94 -u jitdhana -p esp_tracker > backup_$(date +%Y%m%d).sql

# Backup application data
tar -czf workplanv6_backup_$(date +%Y%m%d).tar.gz /opt/workplanv6
```

## 🔍 Troubleshooting

### ปัญหาที่พบบ่อย

1. **Port ถูกใช้งานแล้ว**
   ```bash
   # หา process ที่ใช้ port
   sudo lsof -i :3012
   sudo lsof -i :3102
   
   # Kill process
   sudo kill -9 <PID>
   ```

2. **Database Connection Failed**
   ```bash
   # ทดสอบการเชื่อมต่อ database
   telnet 192.168.0.94 3306
   
   # ตรวจสอบ firewall
   sudo ufw status
   ```

3. **Docker Permission Denied**
   ```bash
   # เพิ่ม user เข้า docker group
   sudo usermod -aG docker $USER
   newgrp docker
   ```

4. **Out of Memory**
   ```bash
   # ดู memory usage
   free -h
   docker stats
   
   # เพิ่ม swap
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## 📞 การเข้าถึงระบบ

หลังจาก deploy เสร็จ:

- **Frontend**: http://192.168.0.96:3012
- **Backend API**: http://192.168.0.96:3102
- **API Documentation**: http://192.168.0.96:3102/api/docs

## 🔒 Security

### Firewall

```bash
# เปิด port ที่จำเป็น
sudo ufw allow 3012
sudo ufw allow 3102
sudo ufw allow 22  # SSH
sudo ufw enable
```

### SSL/HTTPS (แนะนำ)

ใช้ Nginx reverse proxy พร้อม SSL certificate:

```bash
# ติดตั้ง Nginx
sudo apt install nginx

# ติดตั้ง Certbot
sudo apt install certbot python3-certbot-nginx
```

## 📈 Performance Monitoring

### ดู Resource Usage

```bash
# ดู Docker stats
docker stats

# ดู system resources
htop
iostat -x 1
```

### Log Management

```bash
# ดู logs ขนาดใหญ่
docker-compose -f docker-compose.linux.yml logs --tail=1000

# Archive logs
docker-compose -f docker-compose.linux.yml logs > logs_$(date +%Y%m%d).log
```

---

## 🎯 Quick Commands

```bash
# เริ่มระบบ
./deploy-linux.sh

# หยุดระบบ
docker-compose -f docker-compose.linux.yml down

# เริ่มใหม่
docker-compose -f docker-compose.linux.yml up -d

# ดู logs
docker-compose -f docker-compose.linux.yml logs -f

# ดู status
docker-compose -f docker-compose.linux.yml ps
```

---

**📞 Support**: แผนกเทคโนโลยีสารสนเทศ - บริษัท จิตต์ธนา จำกัด
