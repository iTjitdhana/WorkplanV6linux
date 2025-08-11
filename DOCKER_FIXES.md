# Docker Fixes - การแก้ไขปัญหา Docker

## ปัญหาที่พบและวิธีแก้ไข

### 1. TypeScript Error: Cannot find name 'User'

**ปัญหา**: 
```
./lib/api.ts:108:30
Type error: Cannot find name 'User'.
```

**สาเหตุ**: ไฟล์ `frontend/lib/api.ts` ไม่ได้ import type `User` และ types อื่นๆ

**วิธีแก้ไข**:
- เพิ่ม import types ในไฟล์ `frontend/lib/api.ts`:
```typescript
import type { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  Machine, 
  ProductionRoom, 
  ProductionItem, 
  DraftWorkPlan, 
  JobOption, 
  ProductionLog 
} from '../types/production';
```

### 2. Next.js Config Warning

**ปัญหา**:
```
⚠ Invalid next.config.mjs options detected: 
⚠ Unrecognized key(s) in object: 'serverComponentsExternalPackages' at "experimental"
⚠ `experimental.serverComponentsExternalPackages` has been moved to `serverExternalPackages`
```

**สาเหตุ**: Next.js 15 ได้ย้าย `serverComponentsExternalPackages` ออกจาก experimental

**วิธีแก้ไข**:
- อัปเดตไฟล์ `frontend/next.config.mjs`:
```javascript
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['mysql2'], // แทนที่ experimental.serverComponentsExternalPackages
  // ...
};
```

### 3. Docker Compose Version Warning

**ปัญหา**:
```
the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
```

**สาเหตุ**: Docker Compose ใหม่ไม่ต้องการ version attribute

**วิธีแก้ไข**:
- ลบ `version: '3.8'` ออกจากไฟล์ `docker-compose.yml`

### 4. Docker Build Context Issues

**ปัญหา**: Build context ใหญ่เกินไป ทำให้ build ช้า

**วิธีแก้ไข**:
- สร้างไฟล์ `.dockerignore` เพื่อลดขนาด build context
- ย้ายไฟล์ที่ไม่จำเป็นออกจาก build context

## โครงสร้างไฟล์ที่แก้ไขแล้ว

### ไฟล์หลัก
- `docker-compose.yml` - ไฟล์ Docker Compose หลัก
- `Dockerfile` - Dockerfile สำหรับ frontend
- `.dockerignore` - ไฟล์ ignore สำหรับ Docker build

### ไฟล์ที่แก้ไข
- `frontend/lib/api.ts` - เพิ่ม import types
- `frontend/next.config.mjs` - อัปเดต Next.js config
- `tools/docker/docker-compose.yml` - ลบ version attribute

## การใช้งาน

### Build และ Run
```bash
# Build และ start containers
docker-compose up -d

# ดู logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Build แยก
```bash
# Build frontend
docker build -t workplanv6-frontend .

# Build backend
docker build -t workplanv6-backend ./backend
```

## หมายเหตุ

- ตรวจสอบว่า Docker และ Docker Compose เป็นเวอร์ชันล่าสุด
- หากยังมีปัญหา ให้ลบ images และ build ใหม่:
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```
