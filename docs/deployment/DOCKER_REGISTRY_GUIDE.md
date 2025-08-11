# คู่มือการใช้งาน Docker Registry

## 📋 ภาพรวม
Docker Registry คือที่เก็บ Docker images ที่สามารถแชร์ระหว่างเครื่องได้

## 🏢 **Registry หลักๆ**

### 1. **Docker Hub (แนะนำสำหรับเริ่มต้น)**
- **URL**: `docker.io`
- **ฟรี**: ✅
- **ตัวอย่าง**: `your-username/workplan-app`

**วิธีใช้งาน:**
```bash
# 1. สมัครที่ https://hub.docker.com
# 2. สร้าง repository
# 3. Login
docker login

# 4. Tag และ Push
docker tag workplan-app:latest your-username/workplan-app:latest
docker push your-username/workplan-app:latest

# 5. Pull ในอีกเครื่อง
docker pull your-username/workplan-app:latest
```

### 2. **GitHub Container Registry**
- **URL**: `ghcr.io`
- **ฟรี**: ✅
- **ตัวอย่าง**: `ghcr.io/your-username/workplan-app`

**วิธีใช้งาน:**
```bash
# 1. สร้าง GitHub Personal Access Token
# 2. Login
docker login ghcr.io

# 3. Tag และ Push
docker tag workplan-app:latest ghcr.io/your-username/workplan-app:latest
docker push ghcr.io/your-username/workplan-app:latest

# 4. Pull ในอีกเครื่อง
docker pull ghcr.io/your-username/workplan-app:latest
```

### 3. **Google Container Registry (GCR)**
- **URL**: `gcr.io`
- **ฟรี**: ✅ (มีโควต้าการใช้งาน)
- **ตัวอย่าง**: `gcr.io/your-project-id/workplan-app`

### 4. **Amazon ECR**
- **URL**: `your-account-id.dkr.ecr.region.amazonaws.com`
- **ฟรี**: ✅ (มีโควต้าการใช้งาน)
- **ตัวอย่าง**: `123456789.dkr.ecr.us-east-1.amazonaws.com/workplan-app`

## 🛠️ **วิธีสร้าง Registry**

### 1. **ใช้ Script อัตโนมัติ**
```bash
.\setup-docker-registry.bat
```

### 2. **ทำมือ**

#### **Docker Hub:**
```bash
# 1. สมัครที่ https://hub.docker.com
# 2. สร้าง repository ชื่อ "workplan-app"

# 3. Login
docker login

# 4. Build image
docker build -t workplan-app:latest .

# 5. Tag image
docker tag workplan-app:latest your-username/workplan-app:latest

# 6. Push image
docker push your-username/workplan-app:latest
```

#### **GitHub Container Registry:**
```bash
# 1. สร้าง Personal Access Token ที่ GitHub
# Settings > Developer settings > Personal access tokens > Tokens (classic)
# เลือก scopes: write:packages, read:packages

# 2. Login
docker login ghcr.io -u your-username -p your-token

# 3. Build image
docker build -t workplan-app:latest .

# 4. Tag image
docker tag workplan-app:latest ghcr.io/your-username/workplan-app:latest

# 5. Push image
docker push ghcr.io/your-username/workplan-app:latest
```

## 📋 **ข้อมูล Registry ที่ใช้**

### **ตัวอย่างข้อมูล:**
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
- Docker Hub: ใช้ username/password
- GitHub: ใช้ Personal Access Token
- AWS: ใช้ AWS credentials

### 2. **Image Size**
- Docker Hub: ฟรี 1 repository, 200MB/6 months
- GitHub: ฟรี 500MB storage, 1GB bandwidth/month

### 3. **Security**
- ใช้ private repository สำหรับ production
- หมุนเวียน access tokens
- ใช้ multi-stage builds เพื่อลด image size

## 🚀 **Best Practices**

### 1. **Image Naming**
```bash
# ใช้ version tags
docker tag workplan-app:latest your-username/workplan-app:v1.0.0
docker tag workplan-app:latest your-username/workplan-app:latest

# ใช้ semantic versioning
v1.0.0, v1.0.1, v1.1.0, v2.0.0
```

### 2. **Multi-stage Builds**
```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 3. **Security Scanning**
```bash
# Scan image สำหรับ vulnerabilities
docker scan your-username/workplan-app:latest
```

## 📊 **การจัดการ Images**

### 1. **List Images**
```bash
docker images
```

### 2. **Remove Images**
```bash
docker rmi your-username/workplan-app:latest
```

### 3. **Clean Up**
```bash
docker system prune -a
```

## 🔍 **การตรวจสอบ**

### 1. **ตรวจสอบ Registry**
- Docker Hub: https://hub.docker.com/r/your-username/workplan-app
- GitHub: https://github.com/your-username?tab=packages

### 2. **ตรวจสอบ Image**
```bash
docker inspect your-username/workplan-app:latest
```

### 3. **ตรวจสอบ History**
```bash
docker history your-username/workplan-app:latest
```
