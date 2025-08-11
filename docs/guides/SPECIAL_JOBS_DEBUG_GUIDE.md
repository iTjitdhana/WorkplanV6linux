# Special Jobs Debug Guide

## 🎯 **ปัญหาที่พบ**
- งานพิเศษยังปนกับงานปกติใน Google Sheet
- Console logs ไม่แสดง debug information

## 🔧 **การแก้ไขที่ทำ**

### **1. แก้ไข Logic การแยกงานพิเศษ**
```typescript
// แยกงานปกติและงานพิเศษ (ใช้ is_special = 1 หรือ workflow_status_id = 10)
const normalJobs = productionData.filter(item => 
  item.production_date === selectedDate && 
  !(item.isDraft && defaultCodes.includes(item.job_code)) &&
  item.is_special !== 1 && 
  item.workflow_status_id !== 10 // ไม่ใช่งานพิเศษ
);

const specialJobs = productionData.filter(item => 
  item.production_date === selectedDate && 
  !(item.isDraft && defaultCodes.includes(item.job_code)) &&
  (item.is_special === 1 || item.workflow_status_id === 10) // งานพิเศษ
);
```

### **2. เพิ่ม Debug Logging**
```typescript
// Debug: แสดงข้อมูลการแยกงาน
console.log("🔍 [DEBUG] แยกงานพิเศษ:");
console.log("🔍 [DEBUG] งานปกติ:", normalJobs.length, "รายการ");
console.log("🔍 [DEBUG] งานพิเศษ:", specialJobs.length, "รายการ");
console.log("🔍 [DEBUG] งานปกติ:", normalJobs.map(item => ({ 
  job_name: item.job_name, 
  is_special: item.is_special, 
  workflow_status_id: item.workflow_status_id 
})));
console.log("🔍 [DEBUG] งานพิเศษ:", specialJobs.map(item => ({ 
  job_name: item.job_name, 
  is_special: item.is_special, 
  workflow_status_id: item.workflow_status_id 
})));

// Debug: แสดงข้อมูลที่ส่งไป Google Sheet
console.log("🔍 [DEBUG] ข้อมูลที่ส่งไป Google Sheet:");
console.log("🔍 [DEBUG] จำนวนงานทั้งหมด:", filtered.length);
console.log("🔍 [DEBUG] ลำดับงาน:", filtered.map((item, idx) => ({
  ลำดับ: idx + 1,
  job_name: item.job_name,
  is_special: item.is_special,
  workflow_status_id: item.workflow_status_id,
  start_time: item.start_time
})));
```

### **3. แก้ไข Helper Functions**
```typescript
// Helper function to check if item is special
export const isSpecialItem = (item: ProductionItem): boolean => {
  return item.is_special === true || item.is_special === 1 || item.is_special_job === 1 || item.workflow_status_id === 10;
};
```

## 🧪 **วิธีทดสอบ**

### **1. เปิด Developer Console**
1. กด F12 หรือคลิกขวา -> Inspect
2. ไปที่แท็บ Console
3. ล้าง console logs เก่า

### **2. ทดสอบการแยกงานพิเศษ**
1. เลือกวันที่ 11 ส.ค. 2568
2. กดปุ่ม "Sync" (ปุ่มสีฟ้า)
3. ตรวจสอบ console logs

### **3. ตรวจสอบ Console Logs**
ควรเห็น logs เหล่านี้:
```
🟢 [DEBUG] กำลังเปิด Google Sheet...
🟢 [DEBUG] เปิด Google Sheet สำเร็จ
🔍 [DEBUG] แยกงานพิเศษ:
🔍 [DEBUG] งานปกติ: X รายการ
🔍 [DEBUG] งานพิเศษ: Y รายการ
🔍 [DEBUG] งานปกติ: [{job_name: "...", is_special: 0, workflow_status_id: 3}, ...]
🔍 [DEBUG] งานพิเศษ: [{job_name: "น้ำส้มตำไทย", is_special: 1, workflow_status_id: 10}, ...]
🔍 [DEBUG] ข้อมูลที่ส่งไป Google Sheet:
🔍 [DEBUG] จำนวนงานทั้งหมด: Z รายการ
🔍 [DEBUG] ลำดับงาน: [{ลำดับ: 1, job_name: "...", is_special: 0, workflow_status_id: 3, start_time: "08:00"}, ...]
```

### **4. ตรวจสอบ Google Sheet**
1. เปิด Google Sheet ที่ลิงก์
2. ตรวจสอบลำดับงาน:
   - งานปกติควรอยู่ด้านบน
   - งานพิเศษควรอยู่ด้านล่างสุด
   - "น้ำส้มตำไทย" ควรอยู่ท้ายสุด

## 🔍 **การ Debug เพิ่มเติม**

### **1. ตรวจสอบข้อมูลในฐานข้อมูล**
```sql
-- ตรวจสอบงานพิเศษ
SELECT id, job_name, is_special, workflow_status_id, production_date 
FROM work_plans 
WHERE production_date = '2025-08-11' 
AND (is_special = 1 OR workflow_status_id = 10);

-- ตรวจสอบงานปกติ
SELECT id, job_name, is_special, workflow_status_id, production_date 
FROM work_plans 
WHERE production_date = '2025-08-11' 
AND (is_special != 1 OR is_special IS NULL) 
AND (workflow_status_id != 10 OR workflow_status_id IS NULL);
```

### **2. ตรวจสอบ API Response**
1. เปิด Network tab ใน Developer Tools
2. กดปุ่ม Sync
3. ตรวจสอบ API call `/api/send-to-google-sheet`
4. ดู Request payload และ Response

### **3. ตรวจสอบ Frontend Data**
```javascript
// ใน console พิมพ์:
console.log("productionData:", productionData);
console.log("selectedDate:", selectedDate);
```

## ⚠️ **ปัญหาที่อาจเกิดขึ้น**

### **1. ไม่เห็น Debug Logs**
- ตรวจสอบว่า console ไม่ได้ถูก filter
- ตรวจสอบว่า logs ไม่ได้ถูก clear
- ตรวจสอบว่า browser รองรับ console.log

### **2. งานพิเศษยังปนอยู่**
- ตรวจสอบค่า `is_special` และ `workflow_status_id` ในฐานข้อมูล
- ตรวจสอบว่า API ส่งข้อมูลถูกต้อง
- ตรวจสอบว่า Google Sheet รับข้อมูลถูกต้อง

### **3. Type Errors**
- ตรวจสอบว่า TypeScript compilation สำเร็จ
- ตรวจสอบว่า interface ถูกต้อง
- ตรวจสอบว่า helper functions ทำงานถูกต้อง

## 📝 **สรุป**

**การแก้ไขนี้จะทำให้:**
1. **Logic การแยกงานพิเศษถูกต้อง** ใช้ทั้ง `is_special` และ `workflow_status_id`
2. **มี debug logging** เพื่อตรวจสอบการทำงาน
3. **งานพิเศษอยู่ด้านล่างสุด** ตามที่ต้องการ

**วิธีทดสอบ:**
1. เปิด Developer Console
2. กดปุ่ม Sync
3. ตรวจสอบ console logs
4. ตรวจสอบลำดับใน Google Sheet

**หากยังมีปัญหา:**
1. ตรวจสอบ console logs เพื่อดูการแยกงาน
2. ตรวจสอบข้อมูลในฐานข้อมูล
3. ตรวจสอบ API response
