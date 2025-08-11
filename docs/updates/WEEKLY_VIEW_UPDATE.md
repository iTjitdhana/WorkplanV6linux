# Weekly View Update for Production_Planing.tsx

## การเปลี่ยนแปลงที่ทำ

### 1. เพิ่มฟังก์ชันสำหรับสีของแต่ละวัน
- เพิ่ม `getDayBackgroundColor()` - สำหรับสีพื้นหลังของแต่ละวัน
- เพิ่ม `getDayTextColor()` - สำหรับสีข้อความของแต่ละวัน

### 2. อัปเดต Weekly Calendar Layout
- เปลี่ยนจาก Button-based grid เป็น Table-based layout
- เพิ่ม Header Row ที่แสดงชื่อวัน วันที่ และจำนวนงาน
- เพิ่ม Production Content Grid ที่แสดงรายละเอียดงานผลิตในแต่ละวัน

### 3. ปรับปรุง Staff Images Mapping
- รวมทั้งชื่อไทยและ id_code ใน staffImages
- อัปเดต renderStaffAvatars function ให้รองรับทั้งชื่อไทยและ id_code

### 4. แก้ไข Linter Errors
- แก้ไข type comparison error ใน formatProductionDate
- แก้ไข undefined type error ใน searchCache

## โครงสร้างใหม่ของ Weekly View

```typescript
{viewMode === "weekly" ? (
  <div className="space-y-2 sm:space-y-3 md:space-y-4">
    {/* Week Navigation */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
      {/* Previous/Next Week Buttons */}
    </div>

    {/* Weekly Calendar Table */}
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* Header Row - แสดงชื่อวันและจำนวนงาน */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {/* Day Headers with colors */}
        </div>

        {/* Production Content Grid - แสดงรายละเอียดงานผลิต */}
        <div className="grid grid-cols-7 gap-1">
          {/* Production items for each day */}
        </div>
      </div>
    </div>
  </div>
) : (
  {/* Daily View */}
)}
```

## สีของแต่ละวัน

- **อาทิตย์**: สีแดง (bg-red-100, text-red-800)
- **จันทร์**: สีเหลือง (bg-yellow-100, text-yellow-800)
- **อังคาร**: สีชมพู (bg-pink-100, text-pink-800)
- **พุธ**: สีเขียว (bg-green-100, text-green-800)
- **พฤหัสฯ**: สีส้ม (bg-orange-100, text-orange-800)
- **ศุกร์**: สีฟ้า (bg-blue-100, text-blue-800)
- **เสาร์**: สีม่วง (bg-purple-100, text-purple-800)

## การแสดงผลงานผลิต

แต่ละวันจะแสดง:
1. **ชื่องานผลิต** - ชื่องานที่ต้องผลิต
2. **เวลา** - เวลาเริ่ม-สิ้นสุด
3. **หมายเหตุ** - หมายเหตุเพิ่มเติม (ถ้ามี)
4. **สถานะ** - สถานะของงานผลิต

## สถานะงานผลิต

- **รอดำเนินการ**: สีเทา
- **กำลังดำเนินการ**: สีฟ้า
- **เสร็จสิ้น**: สีเขียว
- **งานผลิตถูกยกเลิก**: สีแดง

## การใช้งาน

1. เลือก "รายสัปดาห์" ในปุ่ม view mode
2. ใช้ปุ่ม "สัปดาห์ก่อนหน้า" และ "สัปดาห์ถัดไป" เพื่อเลื่อนสัปดาห์
3. ดูรายละเอียดงานผลิตในแต่ละวัน
4. งานที่ไม่มีจะแสดง "ไม่มีงาน" พร้อมไอคอนปฏิทิน 