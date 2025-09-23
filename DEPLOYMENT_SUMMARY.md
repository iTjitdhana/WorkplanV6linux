# 🚀 WorkplanV6 Linux Deployment Summary

**วันที่:** 23 กันยายน 2567  
**ระบบ:** WorkplanV6 Production Tracking System  
**เซิร์ฟเวอร์:** Linux Server (192.168.0.96)  
**สถานะ:** ✅ Deploy สำเร็จ

---

## 📋 สรุปปัญหาที่เจอและวิธีแก้ไข

### 1. **ปัญหา Docker Compose Environment Variables**
**ปัญหา:** เครื่องหมาย `$` ในรหัสผ่านทำให้ Docker Compose error
```
ERROR: Invalid interpolation format for "environment" option in service "backend": "DB_PASSWORD=iT12345$"
```
**วิธีแก้:** 
- ใช้ไฟล์ `.env` แทนการใส่ใน `docker-compose.yml`
- สร้าง `backend/.env` และใช้ `env_file` ใน compose

### 2. **ปัญหา Docker Compose Version**
**ปัญหา:** `docker-compose` v1 มีบั๊กกับอิมเมจใหม่
```
KeyError: 'ContainerConfig'
```
**วิธีแก้:**
- ติดตั้ง `docker-compose-plugin` (v2)
- ใช้ `docker compose` แทน `docker-compose`

### 3. **ปัญหา TypeScript Errors**
**ปัญหา:** Type mismatches ใน `Production_Planing.tsx`
- `id` type: `string` vs `number`
- `status_name` property ไม่มีใน type
- `Date` vs `string` type issues

**วิธีแก้:**
- แก้ไข type conversions: `parseInt(item.id)`
- ใช้ type assertions: `(item as any).status_name`
- แก้ไข Date/string conversions

### 4. **ปัญหา React Window Dependencies**
**ปัญหา:** `react-window` v2.x เปลี่ยน export structure
```
Module '"react-window"' has no exported member 'FixedSizeList'
```
**วิธีแก้:**
- Downgrade `react-window` จาก v2.1.1 เป็น v1.8.8
- แก้ไข import: `import { InfiniteLoader } from 'react-window-infinite-loader'`

### 5. **ปัญหา InfiniteLoader JSX Component**
**ปัญหา:** `InfiniteLoader` ไม่สามารถใช้เป็น JSX component ได้
```
'InfiniteLoader' cannot be used as a JSX component
```
**วิธีแก้:**
- ใช้ `React.createElement` แทน JSX syntax
- เพิ่ม `as any` type assertion
- เพิ่ม `width="100%"` prop

### 6. **ปัญหา Duplicate Type Definitions**
**ปัญหา:** `ApiResponse` interface ซ้ำกัน
```
Duplicate identifier 'ApiResponse'
```
**วิธีแก้:**
- เปลี่ยนชื่อ interface เป็น `ApiResponseInterface`

### 7. **ปัญหา Next.js Standalone Output**
**ปัญหา:** Docker build ไม่เจอ `.next/standalone` directory
```
"/app/.next/standalone": not found
```
**วิธีแก้:**
- เปิดใช้งาน `output: 'standalone'` ใน `next.config.mjs`

### 8. **ปัญหา Frontend-Backend Connection**
**ปัญหา:** Frontend เชื่อมต่อ Backend ไม่ได้
**วิธีแก้:**
- เปลี่ยนจาก external IP เป็น Docker service names
- `http://192.168.0.96:3102` → `http://backend:3101`

### 9. **ปัญหา Port Mapping**
**ปัญหา:** Port mapping ไม่ตรงกัน
- Frontend: รันที่ 3011 แต่แมพ 3012:3012
- Backend: รันที่ 3101 แต่แมพ 3102:3102

**วิธีแก้:**
- Frontend: `3012:3011`
- Backend: `3102:3101`
- Frontend เชื่อมต่อ Backend: `http://backend:3101`

---

## 🎯 สรุปการแก้ไขทั้งหมด

1. **แก้ไข Environment Variables** - ใช้ไฟล์ `.env`
2. **อัปเกรด Docker Compose** - ใช้ v2
3. **แก้ไข TypeScript Errors** - 5 ไฟล์
4. **แก้ไข Dependencies** - `react-window` และ `react-window-infinite-loader`
5. **แก้ไข Next.js Config** - เปิดใช้งาน `standalone`
6. **แก้ไข Docker Network** - ใช้ service names
7. **แก้ไข Port Mapping** - ให้ตรงกับ internal ports

---

## 🌐 ผลลัพธ์สุดท้าย

- ✅ **Frontend**: http://192.168.0.96:3012
- ✅ **Backend API**: http://192.168.0.96:3102
- ✅ **Database Connection**: เชื่อมต่อได้
- ✅ **Frontend-Backend Communication**: ทำงานได้

---

## 📁 ไฟล์ที่สร้าง/แก้ไข

### ไฟล์ใหม่
- `docker-compose.linux.yml` - Docker Compose สำหรับ Linux
- `deploy-from-github.sh` - Script deploy จาก GitHub
- `install-docker.sh` - Script ติดตั้ง Docker
- `README-Linux-Deploy.md` - คู่มือ Linux deployment
- `GitHub-Deployment-Guide.md` - คู่มือ GitHub deployment

### ไฟล์ที่แก้ไข
- `frontend/Production_Planing.tsx` - แก้ไข TypeScript errors
- `frontend/components/VirtualizedList.tsx` - แก้ไข React Window issues
- `frontend/hooks/useWeeklyCalendar.ts` - แก้ไข undefined variables
- `frontend/types/production.ts` - แก้ไข duplicate interfaces
- `frontend/next.config.mjs` - เปิดใช้งาน standalone output
- `frontend/package.json` - Downgrade react-window
- `.gitignore` - อนุญาต docker-compose.linux.yml

---

## 🚀 คำสั่งสำหรับการใช้งาน

### การ Deploy ครั้งแรก
```bash
# SSH เข้า Linux Server
ssh itjitdhana@192.168.0.96

# Clone repository
git clone https://github.com/iTjitdhana/WorkplanV6linux.git /opt/workplanv6
cd /opt/workplanv6

# ติดตั้ง Docker (ถ้ายังไม่มี)
chmod +x install-docker.sh
./install-docker.sh

# Deploy ระบบ
chmod +x deploy-from-github.sh
./deploy-from-github.sh
```

### การอัปเดทระบบ
```bash
cd /opt/workplanv6
git pull origin main
docker compose -f docker-compose.linux.yml up --build -d
```

### การตรวจสอบสถานะ
```bash
# ดูสถานะ containers
docker compose -f docker-compose.linux.yml ps

# ดู logs
docker compose -f docker-compose.linux.yml logs -f

# ทดสอบ API
curl http://192.168.0.96:3102/health
```

---

## 📞 Support

**แผนกเทคโนโลยีสารสนเทศ**  
**บริษัท จิตต์ธนา จำกัด**

---

**🎉 ระบบ WorkplanV6 ทำงานได้สมบูรณ์แล้วบน Linux Server!**

*อัปเดทล่าสุด: 23 กันยายน 2567*
