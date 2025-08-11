# Task: ปรับโครงสร้างโปรเจกต์ตาม RefactoredAppStructure.md

## เป้าหมาย
- ปรับโครงสร้างโปรเจกต์ให้แยกส่วน UI, API, DB schema, types, styles, และ config ตาม best practice ของ Next.js + TypeScript + Prisma + Tailwind
- รองรับการขยายและ maintain ได้ง่ายในอนาคต

---

## สิ่งที่ต้องเตรียม
- Node.js (v18+)
- Next.js (v13+)
- TypeScript
- Tailwind CSS
- Prisma ORM
- MySQL/MariaDB (หรือ DB ที่รองรับ Prisma)
- VSCode หรือ editor ที่รองรับ TypeScript

---

## ขั้นตอนการปรับโครงสร้าง

### 1. เตรียมโฟลเดอร์/ไฟล์หลัก
- [ ] สร้างโฟลเดอร์/ไฟล์ตาม RefactoredAppStructure.md:
  - `app/`, `components/`, `lib/`, `prisma/`, `styles/`, `types/`, `public/`
  - `tailwind.config.ts`, `tsconfig.json`, `next.config.js`, `.env`, `package.json`

### 2. ย้าย/แยกโค้ดตามหน้าที่
- [ ] ย้ายหน้า page หลักและ route ไปที่ `app/`
- [ ] ย้าย/สร้าง API route (ถ้าใช้ Next.js API) ที่ `app/api/`
- [ ] แยก UI component ไปที่ `components/`
- [ ] แยกฟังก์ชันช่วย/Prisma client ไปที่ `lib/`
- [ ] แยก TypeScript types/interface ไปที่ `types/`
- [ ] ย้าย static asset ไปที่ `public/`
- [ ] ย้าย global CSS ไปที่ `styles/`

### 3. ตั้งค่า/ติดตั้ง dependency
- [ ] ติดตั้ง Next.js, TypeScript, Tailwind, Prisma, dotenv ฯลฯ
- [ ] ตั้งค่า Tailwind (`tailwind.config.ts`)
- [ ] ตั้งค่า TypeScript (`tsconfig.json`)
- [ ] ตั้งค่า Next.js (`next.config.js`)
- [ ] ตั้งค่า .env (เช่น DATABASE_URL, NEXT_PUBLIC_API_URL)

### 4. ตั้งค่า Prisma/DB
- [ ] สร้าง/ย้าย schema ที่ `prisma/schema.prisma`
- [ ] รัน `npx prisma generate` และ `npx prisma migrate dev`
- [ ] สร้าง seed data (optional)

### 5. Refactor โค้ดให้ใช้ import path ใหม่
- [ ] แก้ import ให้ตรงกับโครงสร้างใหม่ (เช่น `import SearchBox from '@/components/SearchBox'`)
- [ ] ปรับ logic ให้ใช้ Prisma/TypeScript/Next.js API ตามโครงสร้างใหม่

### 6. ทดสอบระบบ
- [ ] ทดสอบการ build/run (`npm run dev`)
- [ ] ทดสอบการเชื่อมต่อ DB, API, UI ทุกหน้า
- [ ] ทดสอบการ deploy (ถ้ามี)

---

## หมายเหตุ
- ถ้าใช้ backend แยก (Node/Express) ให้ปรับเฉพาะฝั่ง frontend ตามนี้
- ถ้ามีโค้ด legacy หรือไฟล์ที่ไม่ใช้แล้ว ให้ลบ/ย้ายไป archive
- ควร commit ทีละขั้นตอนเพื่อย้อนกลับได้ง่าย

---

**Checklist นี้สามารถปรับเพิ่ม/ลดได้ตาม use case จริง** 