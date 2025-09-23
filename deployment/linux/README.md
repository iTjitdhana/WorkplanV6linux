# 🐧 Linux Deployment Files

ไฟล์และสคริปต์สำหรับการ Deploy ระบบ WorkplanV6 บน Linux Server

## 📁 ไฟล์ในโฟลเดอร์นี้

### `docker-compose.linux.yml`
Docker Compose configuration สำหรับ Linux Server
- Frontend: port 3012
- Backend: port 3102
- Database: เชื่อมต่อ 192.168.0.94

### `deploy-from-github.sh`
Script หลักสำหรับ Deploy จาก GitHub
- Clone repository
- สร้าง environment files
- Build และรัน Docker containers

### `install-docker.sh`
Script ติดตั้ง Docker และ Docker Compose
- ติดตั้ง Docker CE
- ติดตั้ง Docker Compose Plugin
- ตั้งค่า permissions

### `deploy-linux.sh`
Script deploy แบบเดิม (legacy)
- ใช้สำหรับการ deploy แบบเก่า

### `start-production.sh`
Script เริ่มระบบ production
- เริ่ม Docker containers
- ตรวจสอบสถานะ

## 🚀 การใช้งาน

### Deploy ครั้งแรก
```bash
# ตั้งค่า permissions
chmod +x *.sh

# ติดตั้ง Docker (ถ้ายังไม่มี)
./install-docker.sh

# Deploy ระบบ
./deploy-from-github.sh
```

### การใช้งาน Docker Compose
```bash
# ขึ้นระบบ
docker compose -f docker-compose.linux.yml up -d

# ดูสถานะ
docker compose -f docker-compose.linux.yml ps

# ดู logs
docker compose -f docker-compose.linux.yml logs -f
```

---

**อัปเดทล่าสุด:** 23 กันยายน 2567
