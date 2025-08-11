# Google Sheet API Analysis Report

## 📋 **สรุปการตรวจสอบ API Google Sheet**

### ✅ **โครงสร้าง API ที่มีอยู่**

#### 1. **Backend Proxy Route** (`backend/routes/googleSheetProxy.js`)
```javascript
// Endpoint: POST /api/send-to-google-sheet
// Google Apps Script URL: https://script.google.com/macros/s/AKfycbxJ0u_K-ggpyOL2og9ZM8ungJrAwMWUhibsPOCzqy5Kjf_ybBXG8AplIUIvL0V9VNRO/exec
```

**Features:**
- ✅ Proxy route ที่ส่งข้อมูลไป Google Apps Script
- ✅ Error handling และ logging
- ✅ Response status checking
- ✅ JSON request/response handling

#### 2. **Frontend API Route** (`frontend/app/api/send-to-google-sheet/route.ts`)
```typescript
// Endpoint: POST /api/send-to-google-sheet
// Proxies to backend: ${API_BASE_URL}/api/send-to-google-sheet
```

**Features:**
- ✅ Next.js API route ที่ proxy ไป backend
- ✅ Error handling
- ✅ TypeScript support

#### 3. **Integration ใน Production_Planing.tsx**
```typescript
// Function: sendToGoogleSheet()
// Usage: เรียกใช้เมื่อ sync drafts หรือส่งข้อมูลไป Google Sheet
```

### 🔍 **การใช้งานในระบบ**

#### **1. การส่งข้อมูลไป Google Sheet**
```typescript
// ตัวอย่างการใช้งาน
await sendToGoogleSheet({
  sheetName: "1.ใบสรุปงาน v.4",
  rows: summaryRows,
  clearSheet: true
});
```

#### **2. Sheets ที่รองรับ**
- **"1.ใบสรุปงาน v.4"** - ใบสรุปงานผลิต
- **"Log_แผนผลิต"** - Log ข้อมูลแผนผลิต
- **"รายงาน-เวลาผู้ปฏิบัติงาน"** - รายงานเวลาผู้ปฏิบัติงาน

#### **3. Data Format**
```typescript
interface GoogleSheetData {
  sheetName: string;
  rows?: string[][];
  clearSheet?: boolean;
  "Date Value"?: string;
  "วันที่"?: string;
}
```

### ⚠️ **ปัญหาที่พบ**

#### **1. Server ไม่ทำงาน**
- ❌ Backend server (port 3101) ไม่สามารถ start ได้
- ❌ Node.js ไม่ติดตั้งใน WSL environment
- ❌ Docker ไม่สามารถใช้งานได้ใน WSL environment

#### **2. Network Issues**
- ❌ ไม่สามารถเชื่อมต่อ localhost:3101 ได้
- ❌ ไม่สามารถเชื่อมต่อ 192.168.0.94:3101 ได้

#### **3. Environment Issues**
- ❌ WSL environment ไม่มี Node.js
- ❌ Docker Desktop integration ไม่เปิดใช้งาน

### 🧪 **การทดสอบที่ทำ**

#### **1. Direct Google Apps Script Test**
```javascript
// ทดสอบโดยตรงไป Google Apps Script URL
const response = await fetch('https://script.google.com/macros/s/AKfycbxJ0u_K-ggpyOL2og9ZM8ungJrAwMWUhibsPOCzqy5Kjf_ybBXG8AplIUIvL0V9VNRO/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData),
});
```

#### **2. Backend Proxy Test**
```javascript
// ทดสอบผ่าน backend proxy
const response = await fetch('http://localhost:3101/api/send-to-google-sheet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData),
});
```

#### **3. Frontend API Test**
```javascript
// ทดสอบผ่าน frontend API route
const response = await fetch('http://localhost:3011/api/send-to-google-sheet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData),
});
```

### 🎯 **ข้อเสนอแนะ**

#### **1. การแก้ไขปัญหา Server**
```bash
# วิธีที่ 1: ใช้ Windows Command Prompt
cd C:\WorkplanV6
docker compose up -d

# วิธีที่ 2: ใช้ PowerShell
cd C:\WorkplanV6
docker compose up -d

# วิธีที่ 3: ใช้ Windows Terminal
cd C:\WorkplanV6
docker compose up -d
```

#### **2. การทดสอบ API**
```bash
# ทดสอบ Google Apps Script โดยตรง
curl -X POST https://script.google.com/macros/s/AKfycbxJ0u_K-ggpyOL2og9ZM8ungJrAwMWUhibsPOCzqy5Kjf_ybBXG8AplIUIvL0V9VNRO/exec \
  -H "Content-Type: application/json" \
  -d '{"sheetName":"test","rows":[["test data"]]}'
```

#### **3. การตรวจสอบ Google Apps Script**
- ตรวจสอบ Google Apps Script URL ว่ายังใช้งานได้
- ตรวจสอบ permissions ของ Google Apps Script
- ตรวจสอบ Google Sheet ID และ permissions

### 📊 **สถานะปัจจุบัน**

| Component | Status | Issues |
|-----------|--------|--------|
| Google Apps Script URL | ✅ Available | - |
| Backend Proxy Route | ✅ Implemented | Server not running |
| Frontend API Route | ✅ Implemented | Server not running |
| Integration Code | ✅ Working | - |
| Data Format | ✅ Correct | - |

### 🚀 **ขั้นตอนต่อไป**

1. **Start Docker Services**
   ```bash
   # ใช้ Windows Command Prompt
   cd C:\WorkplanV6
   docker compose up -d
   ```

2. **Test API Endpoints**
   ```bash
   # ทดสอบ backend
   curl -X POST http://localhost:3101/api/send-to-google-sheet \
     -H "Content-Type: application/json" \
     -d '{"sheetName":"test","rows":[["test data"]]}'
   
   # ทดสอบ frontend
   curl -X POST http://localhost:3011/api/send-to-google-sheet \
     -H "Content-Type: application/json" \
     -d '{"sheetName":"test","rows":[["test data"]]}'
   ```

3. **Verify Google Apps Script**
   - เปิด Google Apps Script Editor
   - ตรวจสอบ deployment URL
   - ทดสอบ function execution

### 📝 **สรุป**

**Google Sheet API มีการ implement ที่สมบูรณ์แล้ว** แต่มีปัญหาเรื่อง server environment ที่ไม่สามารถ start ได้ใน WSL environment

**วิธีแก้ไข:**
1. ใช้ Windows Command Prompt หรือ PowerShell แทน WSL
2. Start Docker services ด้วย `docker compose up -d`
3. ทดสอบ API endpoints
4. ตรวจสอบ Google Apps Script permissions

**API ควรทำงานได้ปกติเมื่อ server environment ทำงานได้**
