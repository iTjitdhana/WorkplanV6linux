# 🐙 GitHub Deployment Guide สำหรับ WorkplanV6

คู่มือการ Deploy ระบบ WorkplanV6 บน Linux Server ผ่าน GitHub

## 🎯 ข้อดีของการใช้ GitHub

- ✅ **ง่าย**: ไม่ต้องอัพโหลดไฟล์ด้วยมือ
- ✅ **อัพเดทง่าย**: แค่ push code ใหม่
- ✅ **Version Control**: เก็บประวัติการเปลี่ยนแปลง
- ✅ **Backup**: ข้อมูลอยู่ใน GitHub
- ✅ **Collaboration**: หลายคนทำงานร่วมกันได้

## 📋 ขั้นตอนการตั้งค่า

### 1. สร้าง GitHub Repository

1. ไปที่ https://github.com
2. คลิก **New repository**
3. ตั้งชื่อ: `workplanv6`
4. เลือก **Private** (แนะนำ)
5. คลิก **Create repository**

### 2. อัพโหลดโค้ดไป GitHub

#### วิธีที่ 1: ใช้ GitHub Desktop (ง่ายที่สุด)

1. ดาวน์โหลด: https://desktop.github.com/
2. ติดตั้งและเปิด GitHub Desktop
3. **Clone repository** ที่สร้างไว้
4. **Copy ไฟล์ทั้งหมด** จาก `C:\WorkplanV6` ไปในโฟลเดอร์ที่ clone มา
5. **Commit** และ **Push** ไป GitHub

#### วิธีที่ 2: ใช้ Git Command Line

```bash
# เปิด Command Prompt ในโฟลเดอร์ C:\WorkplanV6
cd C:\WorkplanV6

# เริ่ม Git repository
git init

# เพิ่ม remote repository
git remote add origin https://github.com/YOUR_USERNAME/workplanv6.git

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit
git commit -m "Initial commit - WorkplanV6"

# Push ไป GitHub
git push -u origin main
```

### 3. Deploy บน Linux Server

#### SSH เข้า Linux Server

```bash
ssh itjitdhana@192.168.0.96
# password: iT12345$
```

#### รัน Deployment Script

```bash
# ดาวน์โหลด deployment script
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/workplanv6/main/deploy-from-github.sh

# หรือสร้างไฟล์ด้วยมือ
nano deploy-from-github.sh
# Copy เนื้อหาจากไฟล์ deploy-from-github.sh

# ตั้งค่า permission
chmod +x deploy-from-github.sh

# แก้ไข GitHub URL ในไฟล์
nano deploy-from-github.sh
# เปลี่ยน YOUR_USERNAME เป็น username จริง

# รัน deployment
./deploy-from-github.sh
```

## 🔄 การอัพเดทระบบ

### วิธีที่ 1: อัพเดทจาก Windows

1. **แก้ไขโค้ด** ใน Windows
2. **Commit และ Push** ไป GitHub
3. **SSH เข้า Linux Server**
4. **รันคำสั่ง**:
   ```bash
   cd /opt/workplanv6
   git pull
   docker-compose -f docker-compose.linux.yml up --build -d
   ```

### วิธีที่ 2: Auto Update Script

สร้างไฟล์ `update.sh` บน Linux Server:

```bash
#!/bin/bash
cd /opt/workplanv6
git pull
docker-compose -f docker-compose.linux.yml up --build -d
echo "✅ อัพเดทเสร็จสิ้น!"
```

รัน: `./update.sh`

## 🛠️ การจัดการ Repository

### ไฟล์ที่ควรอยู่ใน GitHub

✅ **ควรมี:**
- `frontend/` - โค้ด Frontend
- `backend/` - โค้ด Backend
- `docker-compose.yml` - Docker configuration
- `Dockerfile` - Docker build files
- `package.json` - Dependencies
- `README.md` - Documentation

❌ **ไม่ควรมี:**
- `node_modules/` - Dependencies (จะ install ใหม่)
- `.env` - Environment variables (สร้างใหม่บน server)
- `logs/` - Log files
- `*.log` - Log files

### การตั้งค่า .gitignore

ไฟล์ `.gitignore` จะป้องกันไม่ให้ไฟล์ที่ไม่จำเป็นถูก push ไป GitHub

## 🔒 Security

### Environment Variables

**อย่า push ไฟล์ `.env` ไป GitHub!**

สร้างไฟล์ `.env.example` แทน:

```bash
# .env.example
NODE_ENV=production
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

### Private Repository

แนะนำให้ใช้ **Private Repository** เพื่อความปลอดภัย

## 📊 Monitoring และ Logs

### ดู Logs

```bash
# ดู logs ทั้งหมด
docker-compose -f docker-compose.linux.yml logs -f

# ดู logs เฉพาะ service
docker-compose -f docker-compose.linux.yml logs -f frontend
docker-compose -f docker-compose.linux.yml logs -f backend
```

### ตรวจสอบ Status

```bash
# ดู status containers
docker-compose -f docker-compose.linux.yml ps

# ดู resource usage
docker stats
```

## 🚨 Troubleshooting

### ปัญหาที่พบบ่อย

1. **Git Clone Failed**
   ```bash
   # ตรวจสอบ network
   ping github.com
   
   # ตรวจสอบ Git
   git --version
   ```

2. **Docker Build Failed**
   ```bash
   # ดู logs
   docker-compose -f docker-compose.linux.yml logs
   
   # ลบ images เก่า
   docker system prune -f
   ```

3. **Permission Denied**
   ```bash
   # ตั้งค่า permission
   chmod +x *.sh
   sudo chown -R $USER:$USER /opt/workplanv6
   ```

## 🎯 Quick Commands

```bash
# Deploy ครั้งแรก
./deploy-from-github.sh

# อัพเดทระบบ
cd /opt/workplanv6 && git pull && docker-compose -f docker-compose.linux.yml up --build -d

# หยุดระบบ
docker-compose -f docker-compose.linux.yml down

# เริ่มระบบ
docker-compose -f docker-compose.linux.yml up -d

# ดู logs
docker-compose -f docker-compose.linux.yml logs -f
```

---

## 📞 Support

**แผนกเทคโนโลยีสารสนเทศ** - บริษัท จิตต์ธนา จำกัด

---

**🎉 หลังจากตั้งค่าเสร็จ คุณจะสามารถ:**
- Push code จาก Windows
- Deploy อัตโนมัติบน Linux Server
- อัพเดทระบบได้ง่ายๆ
- เก็บประวัติการเปลี่ยนแปลง
