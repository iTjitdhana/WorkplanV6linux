# Draft Sorting Update for Production_Planing.tsx

## การเปลี่ยนแปลงการเรียงลำดับงานแบบร่าง

### 1. การเปลี่ยนแปลงหลัก

#### ก่อนการเปลี่ยนแปลง
- งานทั้งหมดเรียงตามเวลา (start_time)
- งานแบบร่างและงานเสร็จแล้วปนกัน

#### หลังการเปลี่ยนแปลง
- งานแบบร่าง (isDraft = true) จะอยู่ด้านล่างสุด
- งานแบบร่างเรียงตามเวลาที่สร้าง (created_at/updated_at)
- งานที่เพิ่มใหม่สุดจะอยู่ล่างสุด

### 2. ลำดับการแสดงผลใหม่

```typescript
// ลำดับการแสดงผลในหน้า Daily View:
1. งาน Default (A, B, C, D) - เรียงตามลำดับ
2. งานปกติที่เสร็จแล้ว - เรียงตามเวลา
3. งานพิเศษที่เสร็จแล้ว - เรียงตามเวลา
4. งานปกติแบบร่าง - เรียงตามเวลาที่สร้าง (เก่าไปใหม่)
5. งานพิเศษแบบร่าง - เรียงตามเวลาที่สร้าง (เก่าไปใหม่)
```

### 3. การเปลี่ยนแปลงในฟังก์ชัน getSortedDailyProduction

#### การแยกงาน
```typescript
// แยกงานเป็นกลุ่มต่างๆ
const defaultDrafts = jobs.filter(j => defaultCodes.includes(j.job_code));
const normalJobs = jobs.filter(j => !defaultCodes.includes(j.job_code) && j.is_special !== 1);
const specialJobs = jobs.filter(j => j.is_special === 1 && !defaultCodes.includes(j.job_code));

// แยกงานแบบร่างออกจากงานปกติ
const normalDrafts = normalJobs.filter(j => j.isDraft);
const normalCompleted = normalJobs.filter(j => !j.isDraft);
const specialDrafts = specialJobs.filter(j => j.isDraft);
const specialCompleted = specialJobs.filter(j => !j.isDraft);
```

#### การเรียงลำดับงานแบบร่าง
```typescript
// เรียงงานแบบร่างตามเวลาที่สร้าง (ใหม่สุดอยู่ล่างสุด)
const sortDraftsByCreatedAt = (a: any, b: any) => {
  const createdAtA = new Date(a.created_at || a.updated_at || 0);
  const createdAtB = new Date(b.created_at || b.updated_at || 0);
  return createdAtA.getTime() - createdAtB.getTime(); // เรียงจากเก่าไปใหม่
};

normalDrafts.sort(sortDraftsByCreatedAt);
specialDrafts.sort(sortDraftsByCreatedAt);
```

### 4. ผลลัพธ์

#### ในหน้า Daily View:
- ✅ งานแบบร่างจะอยู่ด้านล่างสุด
- ✅ งานแบบร่างใหม่สุดจะอยู่ล่างสุด
- ✅ งานเสร็จแล้วยังคงเรียงตามเวลา
- ✅ งาน Default (A, B, C, D) ยังคงอยู่ด้านบนสุด

#### ในหน้า Weekly View:
- ❌ ไม่มีการเปลี่ยนแปลง (ยังคงเรียงตามเวลาเดิม)

### 5. การใช้งาน

1. เมื่อกดปุ่ม "บันทึกแบบร่าง" งานใหม่จะปรากฏที่ด้านล่างสุด
2. งานแบบร่างที่เพิ่มใหม่สุดจะอยู่ล่างสุดเสมอ
3. งานเสร็จแล้วยังคงเรียงตามเวลาปกติ
4. การเปลี่ยนแปลงนี้มีผลเฉพาะในหน้า Daily View เท่านั้น

### 6. ตัวอย่างการแสดงผล

```
┌─────────────────────────────────────┐
│ A - งาน Default                      │
│ B - งาน Default                      │
│ C - งาน Default                      │
│ D - งาน Default                      │
├─────────────────────────────────────┤
│ 08:00 - งานปกติที่เสร็จแล้ว          │
│ 09:00 - งานปกติที่เสร็จแล้ว          │
│ 10:00 - งานพิเศษที่เสร็จแล้ว         │
├─────────────────────────────────────┤
│ งานปกติแบบร่าง (เก่าสุด)             │
│ งานปกติแบบร่าง (ใหม่กว่า)             │
│ งานปกติแบบร่าง (ใหม่สุด) ← เพิ่มล่าสุด│
│ งานพิเศษแบบร่าง                      │
└─────────────────────────────────────┘
``` 