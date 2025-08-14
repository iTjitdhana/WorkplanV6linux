# การเปลี่ยนแปลงค่าเริ่มต้น Auto Refresh

## การเปลี่ยนแปลง

**เปลี่ยนค่าเริ่มต้น Auto Refresh จาก `เปิด` เป็น `ปิด`**

## เหตุผลในการเปลี่ยนแปลง

1. **ป้องกันปัญหา HTTP 429**: ลดการเรียก API อัตโนมัติตั้งแต่เริ่มต้น
2. **ลดการใช้งานเซิร์ฟเวอร์**: ผู้ใช้ต้องเปิดใช้งานเองถ้าต้องการ
3. **ความปลอดภัย**: ป้องกันการใช้งานทรัพยากรมากเกินไปโดยไม่ตั้งใจ
4. **ประสบการณ์ผู้ใช้ที่ดีขึ้น**: ผู้ใช้สามารถเลือกได้ว่าจะเปิดใช้งานหรือไม่

## ไฟล์ที่แก้ไข

### 1. `frontend/app/settings/page.tsx`
```typescript
// เปลี่ยนจาก
const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

// เป็น
const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
```

### 2. `frontend/app/api/settings/auto-refresh/route.ts`
```typescript
// เปลี่ยนจาก
autoRefreshEnabled: data.data.autoRefreshEnabled !== false // default to true

// เป็น
autoRefreshEnabled: data.data.autoRefreshEnabled === true // default to false
```

### 3. `frontend/app/tracker/page.tsx`
```typescript
// เปลี่ยนจาก
const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

// เป็น
const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
```

## ผลกระทบ

### ✅ ผลกระทบเชิงบวก:
- ลดการเกิด HTTP 429 error ตั้งแต่เริ่มต้น
- ลดการใช้งานเซิร์ฟเวอร์
- ผู้ใช้สามารถเลือกได้ว่าจะเปิดใช้งานหรือไม่
- ระบบมีความเสถียรมากขึ้น

### ⚠️ ผลกระทบที่ต้องระวัง:
- ผู้ใช้ใหม่อาจไม่ทราบว่าต้องเปิด Auto Refresh เอง
- ข้อมูลอาจไม่อัปเดตอัตโนมัติจนกว่าผู้ใช้จะเปิดใช้งาน

## การตั้งค่าเริ่มต้นใหม่

```json
{
  "autoRefreshEnabled": false,
  "syncModeEnabled": false
}
```

## วิธีใช้งานสำหรับผู้ใช้ใหม่

### เมื่อเปิดหน้า Tracker ครั้งแรก:
1. **สถานะ**: แสดง "Auto Refresh ปิด" ที่มุมล่างขวา
2. **ปุ่มรีเฟรช**: ปรากฏในหน้า Tracker สำหรับรีเฟรชด้วยตนเอง
3. **การอัปเดต**: ไม่มีการอัปเดตอัตโนมัติ

### หากต้องการเปิด Auto Refresh:
1. ไปที่หน้า **Settings**
2. เลื่อนลงไปที่ส่วน **การตั้งค่า Auto Refresh**
3. เปิดสวิตช์ **Auto Refresh หน้า Tracker**
4. กลับมาหน้า Tracker จะเห็นสถานะเปลี่ยนเป็น "Auto Refresh เปิด"

## การทดสอบ

### ขั้นตอนการทดสอบ:
1. **เปิดหน้า Tracker ใหม่**
2. **ตรวจสอบสถานะ**: ควรแสดง "Auto Refresh ปิด"
3. **ตรวจสอบปุ่มรีเฟรช**: ควรปรากฏในหน้า Tracker
4. **ตรวจสอบ Console Log**: ควรเห็น `[DEBUG] Auto refresh is DISABLED, not starting interval`

### ผลลัพธ์ที่คาดหวัง:
```
[DEBUG] Auto refresh setting loaded: false current: false
[DEBUG] Auto refresh is DISABLED, not starting interval
```

## การปรับปรุงในอนาคต

1. **การแจ้งเตือน**: แสดงข้อความแนะนำให้ผู้ใช้ใหม่เปิด Auto Refresh
2. **การตั้งค่าตามผู้ใช้**: บันทึกการตั้งค่าของแต่ละผู้ใช้
3. **การตั้งค่าช่วงเวลา**: ให้ผู้ใช้เลือกช่วงเวลาการอัปเดต
4. **การแจ้งเตือนอัปเดต**: แจ้งเตือนเมื่อมีข้อมูลใหม่

## สรุป

การเปลี่ยนแปลงนี้จะช่วยให้ระบบมีความเสถียรมากขึ้นและลดการเกิดปัญหา HTTP 429 ตั้งแต่เริ่มต้น ผู้ใช้สามารถเลือกได้ว่าจะเปิดใช้งาน Auto Refresh หรือไม่ตามความต้องการ

