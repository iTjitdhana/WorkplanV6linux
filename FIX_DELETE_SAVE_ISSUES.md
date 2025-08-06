# แก้ไขปัญหา ลบงานและบันทึกแบบร่าง

## ปัญหาที่พบ
- **กดลบงานไม่ได้** - ปุ่มลบไม่ทำงาน
- **บันทึกแบบร่างซ้ำไม่ได้** - ปุ่มบันทึกแบบร่างไม่ทำงาน

## สาเหตุที่เป็นไปได้

### 1. Backend Server ไม่ทำงาน
```cmd
# ตรวจสอบ backend server
netstat -an | findstr :3101
```

### 2. API Endpoints ไม่ทำงาน
```cmd
# ทดสอบ API endpoints
curl "http://localhost:3101/api/work-plans/drafts"
curl -X DELETE "http://localhost:3101/api/work-plans/drafts/1"
curl -X PUT "http://localhost:3101/api/work-plans/drafts/1" -H "Content-Type: application/json" -d "{\"job_name\":\"test\"}"
```

### 3. Database ไม่มีข้อมูล
```sql
-- ตรวจสอบข้อมูลในตาราง work_plan_drafts
SELECT * FROM work_plan_drafts LIMIT 10;
```

## การแก้ไขที่ทำแล้ว

### 1. Backend Routes ✅
ไฟล์: `backend/routes/workPlanRoutes.js`
```javascript
// Draft routes
router.delete('/drafts/:id', DraftWorkPlanController.delete);
router.put('/drafts/:id', DraftWorkPlanController.update);
```

### 2. Backend Controller ✅
ไฟล์: `backend/controllers/workPlanController.js`
```javascript
class DraftWorkPlanController {
  static async delete(req, res) {
    await DraftWorkPlan.delete(req.params.id);
    res.json({ success: true });
  }
  
  static async update(req, res) {
    const draft = await DraftWorkPlan.update(req.params.id, req.body);
    res.json({ success: true, data: draft });
  }
}
```

### 3. Backend Model ✅
ไฟล์: `backend/models/WorkPlan.js`
```javascript
class DraftWorkPlan {
  static async delete(id) {
    await pool.execute('DELETE FROM work_plan_drafts WHERE id = ?', [id]);
    return true;
  }
  
  static async update(id, data) {
    // ... update logic
    await pool.execute('UPDATE work_plan_drafts SET ... WHERE id=?', [...]);
    return { id, ...data };
  }
}
```

### 4. Frontend API Calls ✅
ไฟล์: `frontend/Production_Planing.tsx`
```typescript
// ลบงาน
const handleDeleteDraft = async (draftId: string) => {
  const res = await fetch(`/api/work-plans/drafts/${draftId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
};

// บันทึกแบบร่าง
const handleSaveEditDraft = async (isDraft = false) => {
  const res = await fetch(`/api/work-plans/drafts/${draftId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
};
```

## ขั้นตอนการแก้ไข

### 1. ตรวจสอบ Backend Server
```cmd
# รัน backend server
cd backend
npm run dev

# หรือใช้ไฟล์ batch
.\start-dev-windows.bat
```

### 2. ตรวจสอบ Console ใน Browser
1. เปิด Developer Tools (F12)
2. ไปที่ Console tab
3. ทดสอบลบงานและดู error messages

### 3. ตรวจสอบ Network Tab
1. ไปที่ Network tab ใน Developer Tools
2. ทดสอบลบงานและดู API calls
3. ตรวจสอบ response status และ data

### 4. ตรวจสอบ Database
```sql
-- ตรวจสอบข้อมูลในตาราง work_plan_drafts
SELECT * FROM work_plan_drafts ORDER BY id DESC LIMIT 10;

-- ตรวจสอบว่า draft ID ที่ส่งไปมีอยู่จริง
SELECT * FROM work_plan_drafts WHERE id = 1;
```

### 5. ทดสอบ API ด้วย curl
```cmd
# ทดสอบ GET drafts
curl "http://localhost:3101/api/work-plans/drafts"

# ทดสอบ DELETE draft
curl -X DELETE "http://localhost:3101/api/work-plans/drafts/1"

# ทดสอบ PUT draft
curl -X PUT "http://localhost:3101/api/work-plans/drafts/1" \
  -H "Content-Type: application/json" \
  -d "{\"job_name\":\"test\",\"workflow_status_id\":1}"
```

## ปัญหาที่อาจเกิดขึ้น

### ปัญหา: Backend server ไม่ทำงาน
**วิธีแก้:**
```cmd
cd backend
npm run dev
```

### ปัญหา: API endpoint ไม่ตอบสนอง
**วิธีแก้:**
1. ตรวจสอบ backend server ทำงานอยู่
2. ตรวจสอบ port 3101 ไม่ถูกใช้งาน
3. ตรวจสอบ firewall

### ปัญหา: Database ไม่มีข้อมูล
**วิธีแก้:**
```sql
-- เพิ่มข้อมูลทดสอบ
INSERT INTO work_plan_drafts (production_date, job_code, job_name, workflow_status_id) VALUES
('2025-01-08', 'TEST001', 'งานทดสอบ 1', 1),
('2025-01-08', 'TEST002', 'งานทดสอบ 2', 1);
```

### ปัญหา: Frontend ไม่ส่ง request
**วิธีแก้:**
1. ตรวจสอบ console errors
2. ตรวจสอบ network tab
3. ตรวจสอบ JavaScript errors

## หมายเหตุ

- ใช้ไฟล์ `fix-delete-save-issues.bat` เพื่อตรวจสอบระบบ
- ตรวจสอบ console ใน browser เพื่อดู error details
- ใช้ Network tab ใน Developer Tools เพื่อดู API calls
- ตรวจสอบว่า draft ID ที่ส่งไปมีอยู่จริงใน database 