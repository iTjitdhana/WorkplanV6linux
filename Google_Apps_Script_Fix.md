# Google Apps Script ที่แก้ไขแล้ว

## ปัญหาที่พบ
- Google Apps Script ใช้ `appendRow` สำหรับ "Log_แผนผลิต" 
- แต่เราส่งข้อมูลแบบ batch (`rows` array)
- ต้องแก้ไขให้รองรับ batch เหมือน "1.ใบสรุปงาน v.4"

## Google Apps Script ที่แก้ไขแล้ว

```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheetName = data["sheetName"] || "Log_แผนผลิต";
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

  // 1. 1.ใบสรุปงาน v.4 แบบ batch
  if (sheetName === "1.ใบสรุปงาน v.4" && data["rows"] && Array.isArray(data["rows"])) {
    // clear ก่อน
    if (data["clearSheet"]) {
      var lastRow = sheet.getLastRow();
      if (lastRow >= 4) {
        sheet.getRange("A4:K" + lastRow).clearContent();
      }
    }
    // วางข้อมูลทีเดียว
    var startRow = 4;
    sheet.getRange(startRow, 1, data["rows"].length, 11).setValues(data["rows"]);
    return ContentService.createTextOutput(JSON.stringify({ result: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  // 2. Log_แผนผลิต แบบ batch (ใหม่)
  if (sheetName === "Log_แผนผลิต" && data["rows"] && Array.isArray(data["rows"])) {
    // clear ก่อน
    if (data["clearSheet"]) {
      var lastRow = sheet.getLastRow();
      if (lastRow >= 2) { // เริ่มจากแถวที่ 2
        sheet.getRange("A2:I" + lastRow).clearContent();
      }
    }
    // วางข้อมูลทีเดียว
    var startRow = 2; // เริ่มจากแถวที่ 2
    sheet.getRange(startRow, 1, data["rows"].length, 9).setValues(data["rows"]);
    return ContentService.createTextOutput(JSON.stringify({ result: "success" })).setMimeType(ContentService.MimeType.JSON);
  }

  // 3. ถ้าเป็น รายงาน-เวลาผู้ปฏิบัติงาน และมี Date Value ให้ใส่ที่ D1
  if (sheetName === "รายงาน-เวลาผู้ปฏิบัติงาน" && data["Date Value"]) {
    sheet.getRange("D1").setValue(data["Date Value"]);
  }

  // 4. เตรียมข้อมูลแต่ละ sheet (รายงาน-เวลาผู้ปฏิบัติงาน) - แบบเก่า
  var row = [];
  if (sheetName === "รายงาน-เวลาผู้ปฏิบัติงาน") {
    row = [
      data["วันที่"] || "",
      data["Date Value"] || "",
      data["เลขที่งาน"] || "",
      data["ชื่องาน"] || "",
      data["ผู้ปฏิบัติงาน"] || "",
      data["เวลาเริ่มต้น"] || "",
      data["เวลาสิ้นสุด"] || "",
      data["ห้อง"] || "",
      data["Time Stamp"] || "",
      data["รหัสวัตถุดิบ"] || "",
      data["เครื่อง"] || ""
    ];
  }

  // 5. เพิ่มข้อมูลลง sheet (รายงาน-เวลาผู้ปฏิบัติงาน) - แบบเก่า
  if (row.length > 0 && sheetName === "รายงาน-เวลาผู้ปฏิบัติงาน") {
    sheet.appendRow(row);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ result: "success" })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

## การเปลี่ยนแปลงหลัก

### 1. เพิ่ม Logic สำหรับ "Log_แผนผลิต" แบบ batch
```javascript
// 2. Log_แผนผลิต แบบ batch (ใหม่)
if (sheetName === "Log_แผนผลิต" && data["rows"] && Array.isArray(data["rows"])) {
  // clear ก่อน
  if (data["clearSheet"]) {
    var lastRow = sheet.getLastRow();
    if (lastRow >= 2) { // เริ่มจากแถวที่ 2
      sheet.getRange("A2:I" + lastRow).clearContent();
    }
  }
  // วางข้อมูลทีเดียว
  var startRow = 2; // เริ่มจากแถวที่ 2
  sheet.getRange(startRow, 1, data["rows"].length, 9).setValues(data["rows"]);
  return ContentService.createTextOutput(JSON.stringify({ result: "success" })).setMimeType(ContentService.MimeType.JSON);
}
```

### 2. ลบ Logic เก่าสำหรับ "Log_แผนผลิต"
- ลบการเตรียมข้อมูลแบบ `appendRow` สำหรับ "Log_แผนผลิต"
- เหลือเฉพาะ "รายงาน-เวลาผู้ปฏิบัติงาน"

## ขั้นตอนการแก้ไข

1. เปิด Google Apps Script Editor
2. แทนที่โค้ดเดิมด้วยโค้ดใหม่
3. Save และ Deploy
4. ทดสอบการส่งข้อมูล

## โครงสร้างข้อมูลที่ส่งไป "Log_แผนผลิต"

```javascript
// ข้อมูลที่ส่งจาก Frontend
{
  sheetName: "Log_แผนผลิต",
  rows: [
    ["วันจันทร์ที่ 21/7/68", "21/7/2025", "235025", "มะพร้าวคั่ว", "ป้าน้อย", "09:00", "14:00", "ครัวร้อน A", "21/7/2025, 13:24:20"],
    ["วันจันทร์ที่ 21/7/68", "21/7/2025", "235025", "มะพร้าวคั่ว", "เอ", "09:00", "14:00", "ครัวร้อน A", "21/7/2025, 13:24:20"]
  ],
  clearSheet: true
}
```

## คอลัมน์ใน "Log_แผนผลิต"
1. วันที่ (A)
2. Date Value (B) 
3. เลขที่งาน (C)
4. ชื่องาน (D)
5. ผู้ปฏิบัติงาน (E)
6. เวลาเริ่มต้น (F)
7. เวลาสิ้นสุด (G)
8. ห้อง (H)
9. Time Stamp (I) 