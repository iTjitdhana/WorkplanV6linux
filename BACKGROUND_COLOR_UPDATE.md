# Background Color Update for Production_Planing.tsx

## การเปลี่ยนแปลงพื้นหลัง

### 1. เปลี่ยนพื้นหลังหลัก
- **เดิม**: `bg-green-50/30` (สีเขียวอ่อนโปร่งใส)
- **ใหม่**: `bg-gray-200` (สีเทา)

### 2. เปลี่ยน Card Background
- **เดิม**: `bg-white/80 backdrop-blur-sm` (สีขาวโปร่งใสพร้อม blur effect)
- **ใหม่**: `bg-white` (สีขาวทึบ)

## การเปลี่ยนแปลงที่ทำ

```typescript
// เปลี่ยนพื้นหลังหลัก
<div className={`min-h-screen bg-gray-200 ${notoSansThai.className} flex flex-col`}>

// เปลี่ยน Card background สำหรับฟอร์ม
<Card className="shadow-lg bg-white h-fit">

// เปลี่ยน Card background สำหรับแสดงผลงานผลิต
<Card className="shadow-lg bg-white">
```

## ผลลัพธ์

- พื้นหลังเว็บไซต์เป็นสีเทา (`bg-gray-200`) เหมือนกับใน `WeekilyView.tsx`
- Card ทั้งหมดเป็นสีขาวทึบ (`bg-white`) แทนที่จะเป็นโปร่งใส
- ลบ backdrop-blur effect ออกเพื่อให้เหมือนกับ `WeekilyView.tsx`

## การเปรียบเทียบ

### ก่อนการเปลี่ยนแปลง
- พื้นหลัง: สีเขียวอ่อนโปร่งใส
- Card: สีขาวโปร่งใสพร้อม blur effect

### หลังการเปลี่ยนแปลง
- พื้นหลัง: สีเทา
- Card: สีขาวทึบ

การเปลี่ยนแปลงนี้ทำให้ `Production_Planing.tsx` มีลักษณะเหมือนกับ `WeekilyView.tsx` มากขึ้น 