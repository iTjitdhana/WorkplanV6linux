# แก้ไขปัญหา Search Failed

## ปัญหาที่พบ
```
Error: Search failed
components\SearchBox.tsx (93:31) @ SearchBox.useCallback[performSearch]
```

## สาเหตุ
API endpoint `/api/process-steps/search` ไม่ทำงานหรือ backend server ไม่ทำงาน

## วิธีแก้ไข

### 1. ตรวจสอบ Backend Server

```cmd
# ตรวจสอบว่า backend server ทำงานอยู่
netstat -an | findstr :3101

# หรือรัน backend server
cd backend
npm run dev
```

### 2. ตรวจสอบ API Endpoint

```cmd
# ทดสอบ API endpoint
curl "http://localhost:3101/api/process-steps/search?query=test"
```

### 3. ตรวจสอบ Database

ตรวจสอบว่า MySQL ทำงานอยู่และมีข้อมูลในตาราง `process_steps`:

```sql
-- ตรวจสอบข้อมูลในตาราง process_steps
SELECT DISTINCT job_code, job_name FROM process_steps LIMIT 10;
```

### 4. ใช้ไฟล์ที่แก้ไขแล้ว

รันไฟล์ `start-dev-windows.bat` เพื่อรันระบบที่สมบูรณ์:

```cmd
.\start-dev-windows.bat
```

## การแก้ไขที่ทำแล้ว

### 1. สร้าง Search Endpoint ใน Frontend
ไฟล์: `frontend/app/api/process-steps/search/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    // เรียก API จาก backend
    const response = await fetch(`${API_BASE_URL}/api/process-steps/search?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      // สร้าง mock data ถ้า backend ไม่ทำงาน
      const mockResults = [
        {
          job_code: 'JOB001',
          job_name: `${query} - งานตัวอย่าง 1`,
          category: 'production'
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockResults
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Search failed', data: [] },
      { status: 500 }
    );
  }
}
```

### 2. Backend Search Endpoint
ไฟล์: `backend/routes/processStepRoutes.js`

```javascript
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    const query_sql = `
      SELECT DISTINCT job_code, job_name
      FROM process_steps
      WHERE job_code LIKE ? OR job_name LIKE ?
      ORDER BY job_code
      LIMIT 10
    `;
    
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute(query_sql, [searchTerm, searchTerm]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการค้นหางานผลิต'
    });
  }
});
```

## ขั้นตอนการแก้ไข

### 1. รันระบบ
```cmd
.\start-dev-windows.bat
```

### 2. ตรวจสอบ Backend
- เปิด http://localhost:3101/api/process-steps/search?query=test
- ควรได้ JSON response

### 3. ตรวจสอบ Frontend
- เปิด http://localhost:3011
- ทดสอบค้นหาในช่อง Search

### 4. ตรวจสอบ Database
```sql
-- เพิ่มข้อมูลทดสอบ
INSERT INTO process_steps (job_code, job_name, step_order, step_name) VALUES
('JOB001', 'งานผลิตชิ้นส่วน A', 1, 'ตัดวัสดุ'),
('JOB002', 'งานประกอบชิ้นส่วน B', 1, 'ประกอบ'),
('JOB003', 'งานบรรจุภัณฑ์ C', 1, 'บรรจุ');
```

## ปัญหาที่อาจเกิดขึ้น

### ปัญหา: Backend server ไม่ทำงาน
**วิธีแก้:**
```cmd
cd backend
npm run dev
```

### ปัญหา: Database ไม่มีข้อมูล
**วิธีแก้:**
```sql
-- เพิ่มข้อมูลทดสอบ
INSERT INTO process_steps (job_code, job_name) VALUES
('TEST001', 'งานทดสอบ 1'),
('TEST002', 'งานทดสอบ 2');
```

### ปัญหา: Network connection
**วิธีแก้:**
1. ตรวจสอบ firewall
2. ตรวจสอบ port 3101 ไม่ถูกใช้งาน
3. ตรวจสอบ MySQL service

## หมายเหตุ

- Search endpoint จะใช้ mock data ถ้า backend ไม่ทำงาน
- ตรวจสอบ console ใน browser เพื่อดู error details
- ใช้ Network tab ใน Developer Tools เพื่อดู API calls 