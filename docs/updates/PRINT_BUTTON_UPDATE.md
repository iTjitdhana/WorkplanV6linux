# Print Button Update for Production_Planing.tsx

## การเปลี่ยนแปลงปุ่ม "พิมพ์ใบงานผลิต"

### 1. การเปลี่ยนแปลงที่ทำ

#### ก่อนการเปลี่ยนแปลง
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={handleSyncDrafts}
  disabled={isSubmitting}
  className="flex items-center space-x-1 text-green-600 border-green-300 hover:bg-green-50"
>
  <span className="text-xs">Sync พิมพ์ใบงานผลิต</span>
</Button>
```

#### หลังการเปลี่ยนแปลง
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={handleSyncDrafts}
  disabled={isSubmitting}
  className="bg-white border-green-600 text-green-700 hover:bg-green-50 flex items-center space-x-1 sm:space-x-2 h-7 sm:h-8 md:h-9"
>
  <RefreshCw className={`${isFormCollapsed ? "w-3 h-3 sm:w-4 sm:h-4" : "w-3 h-3"}`} />
  <span
    className={`${
      isFormCollapsed ? "text-xs sm:text-sm md:text-base" : "text-xs sm:text-sm"
    } hidden sm:inline`}
  >
    พิมพ์ใบงานผลิต
  </span>
  <span className={`${isFormCollapsed ? "text-xs sm:text-sm" : "text-xs"} sm:hidden`}>พิมพ์</span>
</Button>
```

### 2. การเปลี่ยนแปลงหลัก

#### สีและสไตล์
- **เดิม**: `text-green-600 border-green-300`
- **ใหม่**: `bg-white border-green-600 text-green-700`

#### ขนาดและ Responsive
- เพิ่ม responsive sizing: `h-7 sm:h-8 md:h-9`
- เพิ่ม responsive spacing: `space-x-1 sm:space-x-2`

#### ไอคอน
- เพิ่ม `RefreshCw` icon
- Responsive icon sizing: `w-3 h-3 sm:w-4 sm:h-4`

#### ข้อความ
- **เดิม**: "Sync พิมพ์ใบงานผลิต"
- **ใหม่**: "พิมพ์ใบงานผลิต" (ลบคำว่า "Sync")
- เพิ่ม responsive text display:
  - Desktop: แสดง "พิมพ์ใบงานผลิต"
  - Mobile: แสดง "พิมพ์"

### 3. การเปรียบเทียบกับ WeekilyView.tsx

ตอนนี้ปุ่มใน `Production_Planing.tsx` มีลักษณะเหมือนกับใน `WeekilyView.tsx`:

- ✅ สีขาวพื้นหลัง
- ✅ ขอบสีเขียว
- ✅ ข้อความสีเขียวเข้ม
- ✅ ไอคอน RefreshCw
- ✅ Responsive sizing
- ✅ Responsive text display

### 4. ผลลัพธ์

- ปุ่มมีลักษณะเหมือนกับใน `WeekilyView.tsx`
- Responsive design ที่ดีขึ้น
- ไอคอนที่สื่อความหมายชัดเจน
- ข้อความที่เหมาะสมกับขนาดหน้าจอ 