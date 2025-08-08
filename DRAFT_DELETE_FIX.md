# แก้ไขปัญหา Draft Delete ไม่ทำงาน

## ปัญหาที่พบ
เมื่อพยายามลบงาน Draft ระบบจะแสดง error:
```
Error: Truncated incorrect INTEGER value: 'draft_1753'
```

## สาเหตุ
Frontend ส่ง ID เป็น `'draft_1753'` แต่ backend คาดหวังให้เป็น integer `1753` สำหรับการ query ฐานข้อมูล

## การแก้ไข

### ไฟล์ที่แก้ไข: `frontend/app/api/work-plans/drafts/[id]/route.ts`

**ก่อนแก้ไข:**
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${API_BASE_URL}/api/work-plans/drafts/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    // ...
  }
}
```

**หลังแก้ไข:**
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // แยก ID จาก format "draft_1753" เป็น "1753"
    const cleanId = id.startsWith('draft_') ? id.replace('draft_', '') : id;
    
    console.log('🗑️ [DEBUG] Original ID:', id);
    console.log('🗑️ [DEBUG] Clean ID:', cleanId);
    
    const response = await fetch(`${API_BASE_URL}/api/work-plans/drafts/${cleanId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    // ...
  }
}
```

### แก้ไขทั้ง DELETE และ PUT methods

- **DELETE method**: สำหรับลบงาน Draft
- **PUT method**: สำหรับอัปเดตงาน Draft

## ผลลัพธ์
- ตอนนี้ระบบจะสามารถลบงาน Draft ได้โดยไม่มี error
- ID จะถูกแปลงจาก `'draft_1753'` เป็น `'1753'` ก่อนส่งไปยัง backend
- Backend จะได้รับ integer ID ที่ถูกต้องสำหรับการ query ฐานข้อมูล

## การทดสอบ
1. รันไฟล์ `fix-draft-delete-issue.bat` เพื่อรีสตาร์ทระบบ
2. เปิด http://localhost:3011
3. ไปที่หน้าเพิ่มงานผลิต
4. สร้างงานใหม่หรือเลือกงานที่มีอยู่
5. ลองลบงาน Draft
6. ควรลบได้โดยไม่มี error

## ไฟล์ที่แก้ไข
- `frontend/app/api/work-plans/drafts/[id]/route.ts` - แก้ไขการแปลง ID

## ไฟล์ที่สร้าง
- `fix-draft-delete-issue.bat` - Script สำหรับรีสตาร์ทระบบและทดสอบ
- `DRAFT_DELETE_FIX.md` - ไฟล์นี้
