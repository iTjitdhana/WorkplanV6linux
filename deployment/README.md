# 🚀 Deployment Directory

โฟลเดอร์นี้จัดเก็บไฟล์และสคริปต์ที่เกี่ยวข้องกับการ Deploy ระบบ WorkplanV6

## 📁 โครงสร้างโฟลเดอร์

### 📂 `linux/`
ไฟล์และสคริปต์สำหรับการ Deploy บน Linux Server
- `docker-compose.linux.yml` - Docker Compose configuration สำหรับ Linux
- `deploy-from-github.sh` - Script deploy จาก GitHub
- `install-docker.sh` - Script ติดตั้ง Docker
- `deploy-linux.sh` - Script deploy แบบเดิม
- `start-production.sh` - Script เริ่มระบบ production

### 📂 `windows/`
ไฟล์และสคริปต์สำหรับการ Deploy บน Windows
- `*.bat` - Batch files สำหรับ Windows
- `*.ps1` - PowerShell scripts

### 📂 `guides/`
คู่มือและเอกสารการ Deploy
- `LINUX_BUILD_GUIDE.md` - คู่มือการ Build บน Linux
- `DEPLOYMENT_SUMMARY.md` - สรุปการ Deploy และปัญหา
- `GitHub-Deployment-Guide.md` - คู่มือ Deploy ผ่าน GitHub
- `README-Linux-Deploy.md` - คู่มือ Linux Deploy แบบเดิม
- `upload-guide-*.md` - คู่มือการอัพโหลดไฟล์

### 📂 `scripts/`
สคริปต์เพิ่มเติมสำหรับการ Deploy

## 🎯 การใช้งาน

### สำหรับ Linux Server
```bash
cd deployment/linux
chmod +x *.sh
./deploy-from-github.sh
```

### สำหรับ Windows
```bash
cd deployment/windows
# ดับเบิลคลิกไฟล์ .bat ที่ต้องการ
```

### ดูคู่มือ
```bash
cd deployment/guides
# เปิดไฟล์ .md ที่ต้องการ
```

---

**อัปเดทล่าสุด:** 23 กันยายน 2567
