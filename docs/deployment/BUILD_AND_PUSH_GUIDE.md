# คู่มือการ Build และ Push Docker Image

## 📋 ภาพรวม
หลังจากสร้าง Repository แล้ว ขั้นตอนต่อไปคือการ build และ push Docker image ไปยัง Registry

## 🛠️ **ไฟล์ที่สร้าง**

### 1. **Dockerfile**
- ไฟล์สำหรับ build Docker image
- ใช้ multi-stage build เพื่อลดขนาด image
- รองรับ Next.js production build

### 2. **.dockerignore**
- ไฟล์สำหรับ exclude ไฟล์ที่ไม่จำเป็น
- ลดขนาด Docker image
- เพิ่มความเร็วในการ build

### 3. **build-and-push.bat**
- Script อัตโนมัติสำหรับ build และ push
- รองรับ Docker Hub และ GitHub Container Registry

## 🚀 **วิธีใช้งาน**

### 1. **ใช้ Script อัตโนมัติ (แนะนำ)**
```bash
.\build-and-push.bat
```

**ขั้นตอน:**
1. ใส่ Username (เช่น `johnsmith`)
2. ใส่ Image Name (เช่น `workplan-app`)
3. เลือก Registry (1=Docker Hub, 2=GitHub)
4. รอให้ build และ push เสร็จ

### 2. **ทำมือ**

#### **Docker Hub:**
```bash
# 1. Build image
docker build -t workplan-app:latest .

# 2. Tag image
docker tag workplan-app:latest your-username/workplan-app:latest

# 3. Login
docker login

# 4. Push image
docker push your-username/workplan-app:latest
```

#### **GitHub Container Registry:**
```bash
# 1. Build image
docker build -t workplan-app:latest .

# 2. Tag image
docker tag workplan-app:latest ghcr.io/your-username/workplan-app:latest

# 3. Login (ใช้ Personal Access Token)
docker login ghcr.io

# 4. Push image
docker push ghcr.io/your-username/workplan-app:latest
```

## 📋 **ข้อมูล Registry**

### **ตัวอย่างข้อมูล Docker Hub:**
```
Registry URL: docker.io
Image Name: johnsmith/workplan-app
```

### **ตัวอย่างข้อมูล GitHub:**
```
Registry URL: ghcr.io
Image Name: johnsmith/workplan-app
```

## 🔄 **การใช้งานในอีกเครื่อง**

### 1. **ใช้ Script อัตโนมัติ**
```bash
.\update-docker-deployment.bat
# เลือกวิธีที่ 2: Docker Registry Pull
# ใส่ Registry URL และ Image Name
```

### 2. **ทำมือ**
```bash
# 1. Pull image
docker pull your-username/workplan-app:latest

# 2. Restart containers
docker-compose down
docker-compose up -d
```

## ⚠️ **ข้อควรระวัง**

### 1. **Authentication**
- **Docker Hub**: ใช้ username/password
- **GitHub**: ใช้ Personal Access Token
- ต้อง login ก่อน push

### 2. **Image Size**
- ใช้ multi-stage build เพื่อลดขนาด
- ใช้ .dockerignore เพื่อ exclude ไฟล์ที่ไม่จำเป็น
- ตรวจสอบขนาด image: `docker images`

### 3. **Build Time**
- ใช้ Docker layer caching
- ใช้ .dockerignore เพื่อลด build context
- ใช้ multi-stage build เพื่อแยก dependencies

## 🔍 **การตรวจสอบ**

### 1. **ตรวจสอบ Image**
```bash
# List images
docker images

# Inspect image
docker inspect your-username/workplan-app:latest

# Check image size
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### 2. **ตรวจสอบ Registry**
- **Docker Hub**: https://hub.docker.com/r/your-username/workplan-app
- **GitHub**: https://github.com/your-username?tab=packages

### 3. **ทดสอบ Image**
```bash
# Run image locally
docker run -p 3000:3000 your-username/workplan-app:latest

# Test in browser
# http://localhost:3000
```

## 🚀 **Best Practices**

### 1. **Version Tagging**
```bash
# ใช้ version tags
docker tag workplan-app:latest your-username/workplan-app:v1.0.0
docker push your-username/workplan-app:v1.0.0

# ใช้ latest tag
docker tag workplan-app:latest your-username/workplan-app:latest
docker push your-username/workplan-app:latest
```

### 2. **Security**
```bash
# Scan image สำหรับ vulnerabilities
docker scan your-username/workplan-app:latest

# ใช้ non-root user ใน Dockerfile
USER nextjs
```

### 3. **Optimization**
```bash
# ใช้ multi-stage build
# ใช้ .dockerignore
# ใช้ layer caching
# ใช้ alpine base image
```

## 📊 **การจัดการ Images**

### 1. **Clean Up**
```bash
# Remove unused images
docker image prune -a

# Remove all unused resources
docker system prune -a
```

### 2. **Update Images**
```bash
# Pull latest image
docker pull your-username/workplan-app:latest

# Update containers
docker-compose pull
docker-compose up -d
```

## 🔧 **Troubleshooting**

### 1. **Build Failed**
- ตรวจสอบ Dockerfile syntax
- ตรวจสอบ dependencies
- ตรวจสอบ build context

### 2. **Push Failed**
- ตรวจสอบ authentication
- ตรวจสอบ network connection
- ตรวจสอบ repository permissions

### 3. **Pull Failed**
- ตรวจสอบ image name
- ตรวจสอบ registry URL
- ตรวจสอบ network connection
