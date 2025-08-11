# WorkplanV6 - Production Planning System

ระบบวางแผนการผลิตที่พัฒนาด้วย Node.js Backend และ Next.js Frontend

## 📁 โครงสร้างโปรเจค

```
WorkplanV6/
├── backend/                 # Node.js Backend API
├── frontend/               # Next.js Frontend Application
├── tools/                  # เครื่องมือและสคริปต์ต่างๆ
│   ├── scripts/           # ไฟล์ .bat และ .sh
│   ├── docker/            # ไฟล์ Docker และ docker-compose
│   ├── deployment/        # สคริปต์การ deploy
│   ├── testing/           # ไฟล์ทดสอบ
│   └── utilities/         # ไฟล์ config และ utilities
├── docs/                  # เอกสารและคู่มือ
│   ├── guides/           # คู่มือการใช้งาน
│   ├── fixes/            # เอกสารการแก้ไขปัญหา
│   ├── updates/          # เอกสารการอัปเดต
│   ├── deployment/       # คู่มือการ deploy
│   └── system/           # เอกสารระบบ
├── scripts/              # สคริปต์เดิม (legacy)
├── database/             # ไฟล์ฐานข้อมูล
├── infra/                # Infrastructure files
├── assets/               # ไฟล์ static assets
├── ssl/                  # ไฟล์ SSL certificates
└── newfrontendlogs/      # Frontend logs system
```

## 🚀 การเริ่มต้นใช้งาน

### 1. ติดตั้ง Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. ตั้งค่าสภาพแวดล้อม
```bash
# Backend
cp backend/env.example backend/.env
# ระบบจะใช้ 192.168.0.94 เป็นค่าเริ่มต้น

# Frontend
cp frontend/env.example frontend/.env.local
# ระบบจะใช้ 192.168.0.94 เป็นค่าเริ่มต้น
```

### 3. เริ่มต้นระบบ
```bash
# วิธีที่ 1: ใช้สคริปต์อัตโนมัติ (แนะนำ)
./tools/scripts/setup-192-168-0-94.bat

# วิธีที่ 2: ใช้ Docker
docker-compose up -d

# วิธีที่ 3: เริ่มต้นแยกกัน
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

### 4. เข้าถึงระบบ
- **Frontend**: http://192.168.0.94:3011
- **Backend API**: http://192.168.0.94:3101
- **Database**: 192.168.0.94:3306

## 🛠️ เครื่องมือและสคริปต์

### Tools Directory
- **scripts/**: ไฟล์ .bat และ .sh สำหรับการจัดการระบบ
- **docker/**: ไฟล์ Docker และ docker-compose
- **deployment/**: สคริปต์การ deploy และ ecosystem config
- **testing/**: ไฟล์ทดสอบ API และระบบ
- **utilities/**: ไฟล์ config และ utilities ต่างๆ

### การใช้งานสคริปต์
```bash
# เริ่มต้นระบบ
./tools/scripts/quick-start.bat

# Deploy ระบบ
./tools/scripts/deploy-production.bat

# ทดสอบระบบ
./tools/scripts/test-system.bat
```

## 📚 เอกสาร

### Docs Directory
- **guides/**: คู่มือการใช้งานและ setup
- **fixes/**: เอกสารการแก้ไขปัญหา
- **updates/**: เอกสารการอัปเดตระบบ
- **deployment/**: คู่มือการ deploy
- **system/**: เอกสารระบบและ architecture

## 🔧 การพัฒนา

### Backend (Node.js + Express)
- API Routes ใน `backend/routes/`
- Controllers ใน `backend/controllers/`
- Models ใน `backend/models/`
- Middleware ใน `backend/middleware/`

### Frontend (Next.js)
- Pages ใน `frontend/app/`
- Components ใน `frontend/components/`
- API Routes ใน `frontend/app/api/`
- Styles ใน `frontend/styles/`

## 📦 Docker

ระบบรองรับการ deploy ด้วย Docker:
```bash
# Build และ run
docker-compose up -d

# ดู logs
docker-compose logs -f

# Stop ระบบ
docker-compose down
```

## 🤝 การมีส่วนร่วม

1. Fork โปรเจค
2. สร้าง feature branch
3. Commit การเปลี่ยนแปลง
4. Push ไปยัง branch
5. สร้าง Pull Request

## 📄 License

โปรเจคนี้อยู่ภายใต้ MIT License - ดูไฟล์ [LICENSE](LICENSE) สำหรับรายละเอียด

## 📞 ติดต่อ

หากมีคำถามหรือปัญหา กรุณาสร้าง Issue ใน GitHub repository
