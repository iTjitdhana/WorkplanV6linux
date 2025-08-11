# การอัปเดต Font เป็น Noto Sans Thai

## 🎯 ภาพรวม
ระบบได้ถูกอัปเดตให้ใช้ **Noto Sans Thai** font ซึ่งเป็น font ที่ออกแบบมาเพื่อรองรับภาษาไทยและภาษาอังกฤษได้อย่างสวยงาม

## 🚀 การอัปเดต

### วิธีที่ 1: ใช้ไฟล์ Batch (แนะนำ)
```bash
update-font.bat
```

### วิธีที่ 2: อัปเดตด้วยตนเอง
```bash
# 1. หยุด Frontend server
# 2. ล้าง cache
cd frontend
rmdir /s /q .next
npm install
npm run dev
```

## 📝 การเปลี่ยนแปลงที่ทำ

### 1. **tailwind.config.ts**
```typescript
fontFamily: {
  sans: ['var(--font-noto-sans-thai)', 'Noto Sans Thai', 'Noto Sans', 'Inter', 'system-ui', 'sans-serif'],
  thai: ['var(--font-noto-sans-thai)', 'Noto Sans Thai', 'sans-serif'],
},
```

### 2. **app/layout.tsx**
```typescript
import { Noto_Sans_Thai } from 'next/font/google'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans-thai',
  display: 'swap',
})

// ใน body element
<body className={`${notoSansThai.variable} font-sans antialiased`}>
```

### 3. **app/globals.css**
```css
:root {
  --font-noto-sans-thai: 'Noto Sans Thai', 'Noto Sans', 'Inter', system-ui, sans-serif;
}
```

## 🎨 คุณสมบัติของ Noto Sans Thai

### ✅ ข้อดี
- **รองรับภาษาไทย**: ออกแบบมาเพื่อภาษาไทยโดยเฉพาะ
- **รองรับภาษาอังกฤษ**: ใช้ Noto Sans สำหรับภาษาอังกฤษ
- **หลายน้ำหนัก**: 100-900 weight
- **Optimized**: ใช้ Next.js font optimization
- **Fast Loading**: ใช้ font-display: swap
- **Fallback**: มี fallback fonts หลายตัว

### 📊 การใช้งาน
- **font-sans**: ใช้ Noto Sans Thai เป็นหลัก
- **font-thai**: ใช้เฉพาะ Noto Sans Thai
- **font-weight**: ใช้ได้ตั้งแต่ 100-900

## 🔧 การปรับแต่งเพิ่มเติม

### เปลี่ยน Font Weight
```typescript
// ใน layout.tsx
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'], // เลือกเฉพาะที่ต้องการ
  variable: '--font-noto-sans-thai',
  display: 'swap',
})
```

### เพิ่ม Font อื่น
```typescript
// ใน layout.tsx
import { Noto_Sans_Thai, Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

// ใน body
<body className={`${notoSansThai.variable} ${inter.variable} font-sans antialiased`}>
```

### ปรับ Tailwind Config
```typescript
// ใน tailwind.config.ts
fontFamily: {
  sans: ['var(--font-noto-sans-thai)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
  thai: ['var(--font-noto-sans-thai)', 'sans-serif'],
  inter: ['var(--font-inter)', 'sans-serif'],
},
```

## 🎯 การใช้งานใน Components

### ใช้ Font หลัก (Noto Sans Thai)
```tsx
<h1 className="font-sans text-2xl font-bold">
  ระบบจัดการการผลิต
</h1>
```

### ใช้ Font เฉพาะ (ถ้ามี)
```tsx
<h1 className="font-thai text-2xl font-bold">
  ข้อความภาษาไทย
</h1>

<p className="font-inter text-sm">
  English text
</p>
```

### ใช้ Font Weight ต่างๆ
```tsx
<p className="font-light">น้ำหนัก 300</p>
<p className="font-normal">น้ำหนัก 400</p>
<p className="font-medium">น้ำหนัก 500</p>
<p className="font-semibold">น้ำหนัก 600</p>
<p className="font-bold">น้ำหนัก 700</p>
<p className="font-extrabold">น้ำหนัก 800</p>
```

## 🔍 การตรวจสอบ

### 1. ตรวจสอบใน Browser
- เปิด Developer Tools
- ไปที่ Elements tab
- ดูที่ Computed styles ของ body
- ควรเห็น `font-family: "Noto Sans Thai", ...`

### 2. ตรวจสอบ Network
- เปิด Developer Tools
- ไปที่ Network tab
- ควรเห็นการโหลด Noto Sans Thai font files

### 3. ตรวจสอบ Performance
- ใช้ Lighthouse
- ตรวจสอบ Font Loading Performance

## 🚨 การแก้ไขปัญหา

### Font ไม่โหลด
```bash
# ล้าง cache
cd frontend
rmdir /s /q .next
npm run dev
```

### Font ผิด
```bash
# ตรวจสอบ import
# ตรวจสอบ variable name
# ตรวจสอบ Tailwind config
```

### Performance ช้า
```typescript
// ลด font weights
weight: ['400', '500', '600'], // ใช้เฉพาะที่จำเป็น
```

## 📱 การทดสอบ

### ข้อความภาษาไทย
- ✅ ระบบจัดการการผลิต
- ✅ ดูและแก้ไขข้อมูลการทำงาน
- ✅ เพิ่ม Log ใหม่

### ข้อความภาษาอังกฤษ
- ✅ Dashboard
- ✅ Logs Management
- ✅ Production Planning

### UI Components
- ✅ Buttons
- ✅ Tables
- ✅ Forms
- ✅ Navigation

## 🎉 ผลลัพธ์

หลังจากอัปเดตแล้ว คุณจะได้:
- ✅ ข้อความภาษาไทยที่สวยงาม
- ✅ ข้อความภาษาอังกฤษที่อ่านง่าย
- ✅ UI ที่ดูเป็นมืออาชีพ
- ✅ Performance ที่ดี
- ✅ Loading ที่เร็ว

---

**หมายเหตุ**: Noto Sans Thai เป็น font ที่พัฒนาโดย Google เพื่อรองรับภาษาไทยและภาษาอื่นๆ ในเอเชีย 