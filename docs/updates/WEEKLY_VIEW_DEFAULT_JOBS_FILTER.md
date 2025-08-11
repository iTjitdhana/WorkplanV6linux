# Weekly View Default Jobs Filter Update

## การกรองงาน A, B, C, D ออกจากหน้า Weekly View

### 1. การเปลี่ยนแปลงหลัก

#### ก่อนการเปลี่ยนแปลง
- หน้า Weekly View แสดงงาน A, B, C, D รวมกับงานอื่นๆ
- งาน A, B, C, D ปรากฏในหน้า Weekly View ทำให้ดูรก

#### หลังการเปลี่ยนแปลง
- หน้า Weekly View ไม่แสดงงาน A, B, C, D
- แสดงเฉพาะงานปกติและงานพิเศษเท่านั้น
- หน้า Daily View ยังคงแสดงงาน A, B, C, D ปกติ

### 2. การเปลี่ยนแปลงในฟังก์ชัน `getSortedWeeklyProduction`, `getWeekProduction` และหน้า Weekly View

#### ก่อนการแก้ไข
```typescript
// ฟังก์ชัน getSortedWeeklyProduction
const getSortedWeeklyProduction = (jobs: any[]) => {
  const defaultCodes = ['A', 'B', 'C', 'D'];
  // งานพิเศษ (is_special === 1)
  const specialJobs = jobs.filter(j => j.is_special === 1 && !defaultCodes.includes(j.job_code));
  // งานปกติ (is_special !== 1, ไม่ใช่ default)
  const normalJobs = jobs.filter(j => !defaultCodes.includes(j.job_code) && j.is_special !== 1);
  // ... เรียงลำดับและส่งคืน
};

// ฟังก์ชัน getWeekProduction
const getWeekProduction = () => {
  const weekStart = weekDates[0].toISOString().split("T")[0];
  const weekEnd = weekDates[6].toISOString().split("T")[0];
  const defaultCodes = ['A', 'B', 'C', 'D'];
  const filteredData = productionData
    .filter((item) => {
      const isInWeekRange = item.production_date >= weekStart && item.production_date <= weekEnd;
      const isNotDefaultDraft = !(item.isDraft && defaultCodes.includes(item.job_code));
      return isInWeekRange && isNotDefaultDraft;
    })
    // ... เรียงลำดับและส่งคืน
};
```

#### หลังการแก้ไข
```typescript
// ฟังก์ชัน getSortedWeeklyProduction
const getSortedWeeklyProduction = (jobs: any[]) => {
  const defaultCodes = ['A', 'B', 'C', 'D'];
  // กรองออกงาน A, B, C, D ทั้งหมด
  const filteredJobs = jobs.filter(j => !defaultCodes.includes(j.job_code));
  
  // งานพิเศษ (is_special === 1)
  const specialJobs = filteredJobs.filter(j => j.is_special === 1);
  // งานปกติ (is_special !== 1)
  const normalJobs = filteredJobs.filter(j => j.is_special !== 1);
  
  // ... เรียงลำดับและส่งคืน
};

// ฟังก์ชัน getWeekProduction
const getWeekProduction = () => {
  const weekStart = weekDates[0].toISOString().split("T")[0];
  const weekEnd = weekDates[6].toISOString().split("T")[0];
  const defaultCodes = ['A', 'B', 'C', 'D'];
  const filteredData = productionData
    .filter((item) => {
      const isInWeekRange = item.production_date >= weekStart && item.production_date <= weekEnd;
      // กรองออกงาน A, B, C, D ทั้งหมด (ทั้งแบบร่างและเสร็จแล้ว)
      const isNotDefaultJob = !defaultCodes.includes(item.job_code);
      return isInWeekRange && isNotDefaultJob;
    })
    // ... เรียงลำดับและส่งคืน
};

// หน้า Weekly View - ใช้ getSortedWeeklyProduction
{weekDates.map((date, index) => {
  const dateStr = date.toISOString().split("T")[0]
  const dayProduction = productionData.filter((item) => item.production_date === dateStr)
  const filteredDayProduction = getSortedWeeklyProduction(dayProduction)
  
  return (
    // แสดงผล filteredDayProduction แทน dayProduction
  )
})}
```

### 3. ผลลัพธ์

#### ✅ **หน้า Weekly View:**
- ❌ ไม่แสดงงาน A, B, C, D
- ✅ แสดงเฉพาะงานปกติและงานพิเศษ
- ✅ เรียงลำดับตามเวลา
- ✅ งานปกติอยู่ก่อน งานพิเศษอยู่หลัง

#### ✅ **หน้า Daily View:**
- ✅ ยังคงแสดงงาน A, B, C, D ปกติ
- ✅ งาน A, B, C, D อยู่ด้านบนสุด
- ✅ ไม่มีการเปลี่ยนแปลง

### 4. ตัวอย่างการแสดงผล

#### หน้า Weekly View (หลังการแก้ไข)
```
┌─────────────────────────────────────┐
│ จันทร์    │ อังคาร   │ พุธ      │
├─────────────────────────────────────┤
│ 08:00 - งานปกติ 1                   │
│ 09:00 - งานปกติ 2                   │
│ 10:00 - งานพิเศษ 1                  │
│ 11:00 - งานพิเศษ 2                  │
│ (ไม่มีงาน A, B, C, D)               │
└─────────────────────────────────────┘
```

#### หน้า Daily View (ไม่เปลี่ยนแปลง)
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
│ งานปกติแบบร่าง                       │
│ งานพิเศษแบบร่าง                      │
└─────────────────────────────────────┘
```

### 5. เหตุผลในการเปลี่ยนแปลง

#### 🎯 **วัตถุประสงค์:**
1. **ลดความรกในหน้า Weekly View**
   - งาน A, B, C, D เป็นงาน default ที่ไม่จำเป็นต้องแสดงในมุมมองรายสัปดาห์
   - ทำให้หน้า Weekly View เน้นแสดงงานที่สำคัญเท่านั้น

2. **แยกมุมมองการใช้งาน**
   - หน้า Daily View: สำหรับดูรายละเอียดงานประจำวัน (รวมงาน default)
   - หน้า Weekly View: สำหรับดูภาพรวมงานสำคัญในสัปดาห์

3. **ปรับปรุง UX**
   - ผู้ใช้สามารถดูงานสำคัญในสัปดาห์ได้ชัดเจนขึ้น
   - ลดข้อมูลที่ไม่จำเป็นในหน้า Weekly View

### 6. การทดสอบ

#### สถานการณ์ทดสอบ
1. **เปิดหน้า Weekly View**
   - ✅ ไม่ควรเห็นงาน A, B, C, D
   - ✅ ควรเห็นเฉพาะงานปกติและงานพิเศษ

2. **เปิดหน้า Daily View**
   - ✅ ควรเห็นงาน A, B, C, D ปกติ
   - ✅ ควรเห็นงานอื่นๆ ปกติ

3. **สลับระหว่าง Daily และ Weekly View**
   - ✅ การกรองควรทำงานถูกต้องในแต่ละหน้า

### 7. การใช้งาน

#### สำหรับผู้ใช้
- **หน้า Weekly View:** ดูภาพรวมงานสำคัญในสัปดาห์ (ไม่มีงาน A, B, C, D)
- **หน้า Daily View:** ดูรายละเอียดงานประจำวัน (รวมงาน A, B, C, D)

#### สำหรับ Developer
- ฟังก์ชัน `getSortedWeeklyProduction` ถูกปรับปรุงให้กรองงาน A, B, C, D ออก
- ฟังก์ชัน `getWeekProduction` ถูกปรับปรุงให้กรองงาน A, B, C, D ออกทั้งหมด (ทั้งแบบร่างและเสร็จแล้ว)
- **หน้า Weekly View** ถูกปรับปรุงให้ใช้ `getSortedWeeklyProduction` แทน `productionData.filter()` โดยตรง
- ฟังก์ชัน `getSortedDailyProduction` ไม่มีการเปลี่ยนแปลง
- การเปลี่ยนแปลงนี้มีผลเฉพาะหน้า Weekly View เท่านั้น 