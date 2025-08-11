# 🚀 คู่มือการอัปเดท Docker ในอีกเครื่อง

## 📋 **ภาพรวม**
เมื่อแก้ไขโค้ดในเครื่องพัฒนา ต้องการให้อีกเครื่องที่รัน Docker ได้รับการอัปเดท

## 🔄 **ขั้นตอนการทำงาน**

### **1. เครื่องพัฒนา (เครื่องคุณ)**

#### **A. Build และ Push Image:**
```bash
# วิธีที่ 1: ใช้ Script อัตโนมัติ
.\build-and-push.bat

# วิธีที่ 2: ทำมือ
docker build -t itjitdhana/workplnav6.2:latest .
docker login
docker push itjitdhana/workplnav6.2:latest
```

#### **B. ข้อมูลที่ใช้:**
```
Registry URL: docker.io
Image Name: itjitdhana/workplnav6.2
Full Image: docker.io/itjitdhana/workplnav6.2:latest
```

### **2. เครื่องที่รัน Docker (อีกเครื่อง)**

#### **A. อัปเดท Image:**
```bash
# วิธีที่ 1: ใช้ Script อัตโนมัติ
.\update-remote-docker.bat

# วิธีที่ 2: ใช้ Script ทั่วไป
.\update-docker-deployment.bat
# เลือก 2: Docker Registry Pull
# Registry URL: docker.io
# Image Name: itjitdhana/workplnav6.2

# วิธีที่ 3: ทำมือ
docker pull itjitdhana/workplnav6.2:latest
docker-compose down
docker-compose up -d
```

## 🛠️ **ไฟล์ที่ใช้**

### **1. เครื่องพัฒนา:**
- `build-and-push.bat` - Build และ Push image
- `Dockerfile` - ไฟล์สำหรับ build image
- `.dockerignore` - ลดขนาด image

### **2. เครื่องที่รัน Docker:**
- `update-remote-docker.bat` - อัปเดทอัตโนมัติ
- `update-docker-deployment.bat` - อัปเดทแบบเลือกวิธี
- `docker-compose.yml` - ไฟล์ config Docker

## ⚡ **วิธีเร็วที่สุด**

### **1. เครื่องพัฒนา:**
```bash
.\build-and-push.bat
# ใส่ข้อมูลตามที่ถาม
```

### **2. เครื่องที่รัน Docker:**
```bash
.\update-remote-docker.bat
```

## 🔍 **การตรวจสอบ**

### **1. ตรวจสอบ Image:**
```bash
# ดู images ที่มี
docker images itjitdhana/workplnav6.2

# ดู details ของ image
docker inspect itjitdhana/workplnav6.2:latest
```

### **2. ตรวจสอบ Containers:**
```bash
# ดูสถานะ containers
docker-compose ps

# ดู logs
docker-compose logs

# ดู logs เฉพาะ service
docker-compose logs frontend
docker-compose logs backend
```

### **3. ตรวจสอบเว็บไซต์:**
```
http://localhost:3011
```

## ⚠️ **ข้อควรระวัง**

### **1. Network:**
- ต้องมี internet connection
- ต้องสามารถเข้าถึง Docker Hub ได้

### **2. Authentication:**
- ต้อง login Docker Hub ก่อน push
- ใช้ `docker login` ในเครื่องพัฒนา

### **3. Permissions:**
- ต้องมีสิทธิ์ push ไปยัง repository
- ต้องมีสิทธิ์ pull จาก repository

## 🚨 **Troubleshooting**

### **1. Push Failed:**
```bash
# ตรวจสอบ login
docker login

# ตรวจสอบ image
docker images

# ตรวจสอบ network
ping docker.io
```

### **2. Pull Failed:**
```bash
# ตรวจสอบ image name
docker search itjitdhana/workplnav6.2

# ตรวจสอบ network
ping docker.io

# ตรวจสอบ authentication
docker login
```

### **3. Container ไม่ทำงาน:**
```bash
# ดู logs
docker-compose logs

# ดูสถานะ
docker-compose ps

# Restart
docker-compose restart
```

## 📊 **การจัดการ Versions**

### **1. Version Tags:**
```bash
# Push หลาย versions
docker tag itjitdhana/workplnav6.2:latest itjitdhana/workplnav6.2:v1.0.0
docker push itjitdhana/workplnav6.2:latest
docker push itjitdhana/workplnav6.2:v1.0.0
```

### **2. Rollback:**
```bash
# Pull version เก่า
docker pull itjitdhana/workplnav6.2:v1.0.0

# Restart ด้วย version เก่า
docker-compose down
docker-compose up -d
```

## 🎯 **สรุป**

### **ขั้นตอนง่ายๆ:**
1. **พัฒนา** → `.\build-and-push.bat`
2. **อัปเดท** → `.\update-remote-docker.bat`

### **ข้อมูลสำคัญ:**
- **Registry**: `docker.io`
- **Image**: `itjitdhana/workplnav6.2`
- **Tag**: `latest`

### **เวลาในการอัปเดท:**
- **Push**: 2-5 นาที (ขึ้นอยู่กับขนาด image)
- **Pull**: 1-3 นาที
- **Restart**: 30 วินาที - 1 นาที

**รวมเวลา**: ประมาณ 5-10 นาที 🚀
