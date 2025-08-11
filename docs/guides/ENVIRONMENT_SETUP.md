# Environment Setup Guide

## การตั้งค่า Environment Mode

ระบบนี้รองรับการรันใน 2 โหมด:

### 1. Development Mode (localhost)
- **Frontend**: http://localhost:3011
- **Backend**: http://localhost:3101
- **ใช้สำหรับ**: การพัฒนาและทดสอบในเครื่องเดียว

### 2. Production Mode (192.168.0.94)
- **Frontend**: http://192.168.0.94:3011
- **Backend**: http://192.168.0.94:3101
- **ใช้สำหรับ**: การใช้งานจริงในเครือข่าย

## วิธีการรัน

### วิธีที่ 1: ใช้ Batch Files (แนะนำ)

#### รันแบบเลือกโหมด:
```bash
start-both.bat
```
ระบบจะให้เลือกโหมดที่ต้องการ

#### รัน Development Mode โดยตรง:
```bash
start-dev.bat
```

#### รัน Production Mode โดยตรง:
```bash
start-production.bat
```

### วิธีที่ 2: ใช้ npm scripts

#### Development Mode:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Production Mode:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

## การตั้งค่า Environment Variables

### Backend (.env file)
สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`:

```env
# Environment Configuration
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=esp_tracker

# API Configuration
PORT=3101
API_RATE_LIMIT=100

# Frontend URL
FRONTEND_URL=http://localhost:3011

# Production Settings
PRODUCTION_HOST=192.168.0.94
PRODUCTION_FRONTEND_URL=http://192.168.0.94:3011
```

## การเปลี่ยนแปลงที่ทำ

### Frontend (package.json)
- `dev`: ใช้ `localhost`
- `start`: ใช้ `192.168.0.94`

### Backend (server.js)
- เพิ่มการตรวจสอบ `NODE_ENV`
- เลือก IP address ตาม environment
- แสดง URL ที่ถูกต้องตามโหมด

### Backend (package.json)
- `dev`: ตั้ง `NODE_ENV=development`
- `start`: ตั้ง `NODE_ENV=production`

## หมายเหตุ

- Development mode จะใช้ `localhost` สำหรับการพัฒนาในเครื่องเดียว
- Production mode จะใช้ `192.168.0.94` สำหรับการใช้งานในเครือข่าย
- ระบบจะแสดง URL ที่ถูกต้องตามโหมดที่เลือก
- CORS settings รองรับทั้ง localhost และ network IPs 