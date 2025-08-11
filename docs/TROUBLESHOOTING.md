# คู่มือการแก้ไขปัญหา Docker WorkplanV6

## ปัญหาที่พบบ่อย

### 1. Docker ไม่ได้ทำงาน
**อาการ**: `-sh: docker: not found` หรือ `docker: command not found`

**วิธีแก้ไข**:
```bash
# ตรวจสอบการติดตั้ง
./check-docker.sh

# หากยังไม่ได้ติดตั้ง
./install-docker.sh
```

**สำหรับ Windows**:
1. ติดตั้ง Docker Desktop จาก https://www.docker.com/products/docker-desktop/
2. เปิด Docker Desktop
3. รอให้ Docker Engine เริ่มต้นเสร็จ
4. รีสตาร์ท terminal

### 2. npm ไม่ได้ติดตั้ง
**อาการ**: `-sh: npm: not found`

**วิธีแก้ไข**:
1. ติดตั้ง Node.js จาก https://nodejs.org/
2. npm จะติดตั้งมาพร้อมกับ Node.js
3. รีสตาร์ท terminal

### 3. Port ถูกใช้งาน
**อาการ**: `port is already allocated` หรือ `address already in use`

**วิธีแก้ไข**:
```bash
# ตรวจสอบ port ที่ใช้งาน
netstat -tulpn | grep :3011
netstat -tulpn | grep :3101

# หยุด process ที่ใช้ port
sudo kill -9 <PID>

# หรือเปลี่ยน port ใน docker-compose.yml
```

### 4. Build ไม่สำเร็จ
**อาการ**: `build failed` หรือ `npm install` errors

**วิธีแก้ไข**:
```bash
# ลบ cache และ build ใหม่
docker system prune -a
docker-compose build --no-cache

# หรือลบ node_modules และ build ใหม่
rm -rf frontend/node_modules backend/node_modules
./docker-build.sh
```

### 5. Database Connection Error
**อาการ**: `ECONNREFUSED` หรือ `connection refused`

**วิธีแก้ไข**:
1. ตรวจสอบว่า MySQL ทำงานที่ `192.168.0.94:3306`
2. ตรวจสอบ credentials ใน `docker-compose.yml`
3. ตรวจสอบ firewall settings
4. ตรวจสอบ network connectivity

### 6. Permission Denied
**อาการ**: `permission denied` หรือ `access denied`

**วิธีแก้ไข**:
```bash
# ให้สิทธิ์ execute
chmod +x *.sh

# หรือรันด้วย sudo (Linux)
sudo ./docker-build.sh
```

## ขั้นตอนการแก้ไขปัญหา

### ขั้นตอนที่ 1: ตรวจสอบระบบ
```bash
./check-docker.sh
```

### ขั้นตอนที่ 2: ติดตั้ง Docker (หากจำเป็น)
```bash
./install-docker.sh
```

### ขั้นตอนที่ 3: Build ระบบ
```bash
./docker-build.sh
```

### ขั้นตอนที่ 4: ตรวจสอบ logs
```bash
# ดู logs
docker-compose logs -f

# ดู logs เฉพาะ service
docker-compose logs -f frontend
docker-compose logs -f backend
```

## คำสั่งที่มีประโยชน์

### ตรวจสอบสถานะ
```bash
# ตรวจสอบ Docker
docker info
docker version

# ตรวจสอบ containers
docker ps
docker-compose ps

# ตรวจสอบ images
docker images
```

### ลบและสร้างใหม่
```bash
# ลบ containers
docker-compose down

# ลบ images
docker-compose down --rmi all

# ลบ cache
docker system prune -a

# สร้างใหม่
docker-compose up -d --build
```

### ตรวจสอบ logs
```bash
# ดู logs ทั้งหมด
docker-compose logs

# ดู logs แบบ real-time
docker-compose logs -f

# ดู logs เฉพาะ service
docker-compose logs -f frontend
docker-compose logs -f backend

# ดู logs ของ container เฉพาะ
docker logs <container_id>
```

## การติดต่อขอความช่วยเหลือ

หากยังแก้ไขปัญหาไม่ได้ กรุณาให้ข้อมูลต่อไปนี้:

1. **Operating System**: Windows/macOS/Linux
2. **Docker Version**: `docker --version`
3. **Error Message**: ข้อความ error ที่ได้รับ
4. **Logs**: ผลลัพธ์จาก `docker-compose logs`
5. **System Info**: `docker info`

## ลิงก์ที่มีประโยชน์

- **Docker Desktop**: https://www.docker.com/products/docker-desktop/
- **Docker Documentation**: https://docs.docker.com/
- **Node.js**: https://nodejs.org/
- **Docker Hub**: https://hub.docker.com/
