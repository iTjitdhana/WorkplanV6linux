# Tools Directory

โฟลเดอร์นี้เก็บเครื่องมือและสคริปต์ต่างๆ สำหรับการจัดการระบบ WorkplanV6

## 📁 โครงสร้าง

### scripts/
ไฟล์ .bat และ .sh สำหรับการจัดการระบบ
- `quick-start.bat` - เริ่มต้นระบบอย่างรวดเร็ว
- `deploy-production.bat` - Deploy ระบบไปยัง production
- `test-system.bat` - ทดสอบระบบ
- `fix-*.bat` - สคริปต์แก้ไขปัญหาต่างๆ

### docker/
ไฟล์ Docker และ docker-compose
- `Dockerfile` - Docker image configuration
- `docker-compose.yml` - Docker Compose configuration
- `docker-compose.prod.yml` - Production Docker Compose
- `docker-compose.github.yml` - GitHub Actions Docker Compose
- `docker-*.sh` - สคริปต์ Docker management

### deployment/
สคริปต์การ deploy และ ecosystem config
- `deploy.sh` - สคริปต์ deploy หลัก
- `setup-github.sh` - ตั้งค่า GitHub repository
- `start-dev.sh` - เริ่มต้น development environment
- `ecosystem.config.js` - PM2 ecosystem configuration

### testing/
ไฟล์ทดสอบ API และระบบ
- `test-google-script-direct.js` - ทดสอบ Google Apps Script
- `test-google-sheet-api.js` - ทดสอบ Google Sheets API

### utilities/
ไฟล์ config และ utilities ต่างๆ
- `nginx.conf` - Nginx configuration
- `mysql-config.cnf` - MySQL configuration
- `*.ps1` - PowerShell scripts
- `indextracker.html` - HTML utility
- `ip-config.txt` - IP configuration

## 🚀 การใช้งาน

### เริ่มต้นระบบ
```bash
# Windows
./tools/scripts/quick-start.bat

# Linux/Mac
./tools/scripts/quick-start.sh
```

### Deploy ระบบ
```bash
# Production
./tools/scripts/deploy-production.bat

# Development
./tools/scripts/deploy-dev.bat
```

### ทดสอบระบบ
```bash
# ทดสอบ API
./tools/scripts/test-api.bat

# ทดสอบ Database
./tools/scripts/test-database.bat
```

### Docker Management
```bash
# Build และ run
./tools/docker/docker-build.sh

# Push to registry
./tools/docker/docker-push.sh

# Deploy with Docker
./tools/docker/docker-deploy.sh
```

## 📝 หมายเหตุ

- ไฟล์ .bat สำหรับ Windows
- ไฟล์ .sh สำหรับ Linux/Mac
- ไฟล์ .ps1 สำหรับ PowerShell
- ตรวจสอบสิทธิ์การรันสคริปต์ก่อนใช้งาน
