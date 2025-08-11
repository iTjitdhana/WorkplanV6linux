# Google Sheet Sync Fix Report

## 🐛 **ปัญหาที่พบ**

### **อาการของปัญหา**
- กดปุ่ม Sync แล้วเด้งไป Google Sheet ✅
- แต่ข้อมูลไม่ส่งไป Google Sheet ❌
- ไม่มี error message แสดง ❌

### **สาเหตุของปัญหา**
1. **Backend Server ไม่ทำงาน**
   - WSL environment ไม่มี Node.js
   - Docker ไม่สามารถใช้งานได้ใน WSL
   - Backend server (port 3101) ไม่สามารถ start ได้

2. **API Route เรียกผิด**
   - `sendToGoogleSheet` function เรียกไปที่ backend proxy
   - Backend proxy ไม่ทำงาน
   - ทำให้ข้อมูลไม่ส่งไป Google Apps Script

## 🔧 **การแก้ไข**

### **1. แก้ไข Frontend API Route**
**ไฟล์:** `frontend/app/api/send-to-google-sheet/route.ts`

**เปลี่ยนจาก:**
```typescript
// เรียกไปที่ backend proxy
const response = await fetch(`${API_BASE_URL}/api/send-to-google-sheet`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
```

**เป็น:**
```typescript
// เรียกไปที่ Google Apps Script โดยตรง
const response = await fetch(GOOGLE_SCRIPT_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
```

### **2. แก้ไข sendToGoogleSheet Function**
**ไฟล์:** `frontend/Production_Planing.tsx`

**เปลี่ยนจาก:**
```typescript
const url = getApiUrl('/api/send-to-google-sheet');
```

**เป็น:**
```typescript
const url = '/api/send-to-google-sheet';
```

### **3. เพิ่ม Error Handling และ Logging**
- เพิ่ม console.log เพื่อ debug
- เพิ่ม error handling ที่ดีขึ้น
- แสดง response status และ data

## 🧪 **การทดสอบ**

### **1. ทดสอบ Google Apps Script โดยตรง**
```bash
# ใช้ curl ทดสอบ
curl -X POST https://script.google.com/macros/s/AKfycbxJ0u_K-ggpyOL2og9ZM8ungJrAwMWUhibsPOCzqy5Kjf_ybBXG8AplIUIvL0V9VNRO/exec \
  -H "Content-Type: application/json" \
  -d '{"sheetName":"test","rows":[["test data"]]}'
```

### **2. ทดสอบ Frontend API Route**
```bash
# ทดสอบผ่าน frontend API
curl -X POST http://localhost:3011/api/send-to-google-sheet \
  -H "Content-Type: application/json" \
  -d '{"sheetName":"test","rows":[["test data"]]}'
```

### **3. ทดสอบใน Browser**
- เปิด Developer Tools (F12)
- ดู Console logs
- ดู Network tab เพื่อดู API calls

## 📊 **ผลลัพธ์ที่คาดหวัง**

### **เมื่อแก้ไขแล้ว:**
1. ✅ กดปุ่ม Sync แล้วเด้งไป Google Sheet
2. ✅ ข้อมูลส่งไป Google Sheet สำเร็จ
3. ✅ แสดง success message
4. ✅ ข้อมูลปรากฏใน Google Sheet

### **Console Logs ที่ควรเห็น:**
```
🟡 [DEBUG] call sendToGoogleSheet {sheetName: "1.ใบสรุปงาน v.4", rows: [...]}
🟡 [DEBUG] Google Sheet URL: /api/send-to-google-sheet
📡 [Frontend API] Sending to Google Sheet: {sheetName: "1.ใบสรุปงาน v.4", rows: [...]}
📡 [Frontend API] Google Script response status: 200
📡 [Frontend API] Google Script response: Success
🟢 [DEBUG] Google Sheet result: Success
```

## 🚀 **ขั้นตอนการทดสอบ**

### **1. Start Frontend Server**
```bash
cd frontend
npm run dev
```

### **2. ทดสอบ Sync Function**
1. เปิด browser ไปที่ `http://localhost:3011`
2. เลือกวันที่ที่มีข้อมูล
3. กดปุ่ม "Sync Drafts"
4. ตรวจสอบ console logs
5. ตรวจสอบ Google Sheet

### **3. ตรวจสอบ Error**
- หากมี error ให้ดู console logs
- ตรวจสอบ Network tab ใน Developer Tools
- ตรวจสอบ Google Apps Script permissions

## ⚠️ **ข้อควรระวัง**

### **1. Google Apps Script Permissions**
- ตรวจสอบว่า Google Apps Script URL ยังใช้งานได้
- ตรวจสอบ permissions ของ Google Sheet
- ตรวจสอบ Google Apps Script deployment

### **2. CORS Issues**
- Google Apps Script อาจมี CORS restrictions
- หากมีปัญหาให้ใช้ backend proxy แทน

### **3. Rate Limiting**
- Google Apps Script มี rate limiting
- ไม่ควรเรียก API บ่อยเกินไป

## 📝 **สรุป**

**การแก้ไขนี้จะทำให้:**
1. **ข้อมูลส่งไป Google Sheet ได้** โดยไม่ต้องพึ่ง backend server
2. **มี error handling ที่ดีขึ้น** แสดงข้อผิดพลาดที่ชัดเจน
3. **มี logging ที่ดีขึ้น** เพื่อ debug ปัญหา

**วิธีทดสอบ:**
1. Start frontend server
2. กดปุ่ม Sync
3. ตรวจสอบ console logs
4. ตรวจสอบ Google Sheet

**หากยังมีปัญหา:**
1. ตรวจสอบ Google Apps Script URL
2. ตรวจสอบ Google Sheet permissions
3. ดู console logs เพื่อ debug
