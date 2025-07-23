# Machine Mapping Logic สำหรับ Google Sheet Export

## ปัญหาที่พบ
- ข้อมูลในตาราง `work_plan_drafts` เก็บ `machine_id` (ตัวเลข เช่น 1, 2, 3)
- แต่ต้องการส่ง `machine_name` (ชื่อเครื่อง เช่น "NEC-01", "iPad-01") ไป Google Sheet
- ต้อง map จาก `machine_id` ไปหา `machine_name` ในตาราง `machines`

## โครงสร้างฐานข้อมูล

### ตาราง `work_plan_drafts`
```sql
machine_id: INTEGER (หรือ NULL)
-- ตัวอย่าง: 1, 2, 3, NULL
```

### ตาราง `machines`
```sql
id: INTEGER (Primary Key)
machine_code: VARCHAR (เช่น "NEC-01", "iPad-01")
machine_name: VARCHAR (เช่น "NEC-01", "iPad Terminal 02")
machine_type: VARCHAR (เช่น "NEC", "iPad", "FUJI")
location: VARCHAR (เช่น "ครัวร้อน A", "ครัวเย็น B")
status: VARCHAR (เช่น "active", "maintenance")
```

## Logic การ Map

### 1. ฟังก์ชัน `getMachineNameById`
```typescript
const getMachineNameById = (machineId) => {
  if (!machineId) return "";
  const machine = machines.find(m => m.id?.toString() === machineId?.toString());
  return machine ? machine.machine_name : "";
};
```

### 2. การใช้งานใน Google Sheet Export
```typescript
const summaryRows = filtered.map((item, idx) => {
  let ops = (item.operators || "").split(", ").map((s) => s.trim());
  while (ops.length < 4) ops.push("");
  return [
    idx + 1, // ลำดับ
    item.job_code || "",
    item.job_name || "",
    ops[0], ops[1], ops[2], ops[3], // ผู้ปฏิบัติงาน 1-4
    item.start_time || "",
    item.end_time || "",
    getMachineNameById(item.machine_id), // ส่งชื่อเครื่อง
    getRoomNameByCodeOrId(item.production_room) // ส่งชื่อห้อง
  ];
});
```

## ขั้นตอนการทำงาน

1. **ดึงข้อมูล machines**: โหลดข้อมูลจาก `/api/machines` เก็บใน state `machines`
2. **กรองข้อมูล**: เลือกเฉพาะงานที่ไม่ใช่ default drafts (A, B, C, D)
3. **เรียงลำดับ**: ตาม logic เวลาและผู้ปฏิบัติงาน
4. **Map ข้อมูล**: แปลง `machine_id` เป็น `machine_name`
5. **ส่งข้อมูล**: ส่ง `summaryRows` ไป Google Sheet

## ผลลัพธ์

### ก่อนแก้ไข
```
เครื่องที่: "" (ค่าว่าง)
```

### หลังแก้ไข
```
เครื่องที่: "NEC-01", "iPad-01", "FUJI-01" (ชื่อเครื่อง)
```

## การจัดการ Edge Cases

- **machine_id = NULL**: ส่งค่าว่าง ""
- **ไม่เจอ machine ในฐานข้อมูล**: ส่งค่าว่าง ""
- **machine_id ไม่ตรงกับ id ในตาราง machines**: ส่งค่าว่าง ""

## ไฟล์ที่เกี่ยวข้อง

- `frontend/Production_Planing.tsx`: ฟังก์ชัน `getMachineNameById` และ `handleSyncDrafts`
- `backend/routes/googleSheetProxy.js`: Proxy สำหรับส่งข้อมูลไป Google Sheet
- ตาราง `work_plan_drafts`: ข้อมูล machine_id
- ตาราง `machines`: ข้อมูล machine_name 