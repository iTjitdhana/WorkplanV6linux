# Production Planning Tasks Checklist

## 1. Draft Plan (บันทึกแบบร่าง)
- [x] ผู้ใช้สามารถกรอกชื่องานและบันทึกแบบร่างได้ (POST ไป work_plan_drafts)
- [x] แสดงรายการแบบร่างในหน้าแผน
- [x] แก้ไข route order ใน backend (drafts routes ต้องมาก่อน /:id)
- [x] แก้ไข frontend mapping สำหรับ draft data
- [x] แก้ไข Daily View ให้แสดงข้อมูลจริงแทน hardcoded data
- [x] แก้ไข date filtering ใน Daily View

## 2. Edit & Complete Draft (แก้ไขและกรอกข้อมูลเพิ่มเติม)
- [ ] มีปุ่ม ✏️ (Edit) สำหรับแก้ไข draft
- [ ] Popup/modal สำหรับกรอกข้อมูลเพิ่มเติม (ผู้ปฏิบัติงาน, เวลา, ห้อง, เครื่อง)
- [ ] Logic ตรวจสอบความครบถ้วนของข้อมูล (validate)
- [ ] เปลี่ยนสถานะ draft เป็น "บันทึกเสร็จสิ้น" เมื่อข้อมูลครบ
- [ ] ถ้าข้อมูลยังไม่ครบ สถานะยังคงเป็น "แบบร่าง"

## 3. Sync to Real Plan After 18:00 (บันทึกเข้าสู่ตารางจริงหลัง 18:00)
- [x] มีปุ่ม Sync สำหรับ sync งานที่สถานะ "บันทึกเสร็จสิ้น" จาก work_plan_drafts ไป work_plans
- [x] ล็อกแผนใน work_plans ไม่ให้ลำดับเปลี่ยน
- [ ] มี scheduled job/cron ฝั่ง backend สำหรับ sync อัตโนมัติหลัง 18:00 (Asia/Bangkok)

## 4. After 18:00 Management (การจัดการหลัง 18:00)
- [x] งานที่เพิ่มหลัง กดปุ่ม sync ถูกจัดเป็น "งานพิเศษ 1", "งานพิเศษ 2", ...
- [x] งานใน work_plans ไม่สามารถลบได้
- [x] มีปุ่ม/ฟังก์ชัน "ยกเลิกการผลิต" (update สถานะเป็น "ยกเลิกการผลิต")

## 5. Status & Table Display (สถานะและการแสดงผล)
- [x] แสดงสถานะ "แบบร่าง", "บันทึกเสร็จสิ้น" ใน UI
- [x] แสดงสถานะ "งานพิเศษ", "ยกเลิกการผลิต" ใน UI
- [x] แสดงข้อมูลจาก work_plans และ work_plan_drafts แยกตามสถานะ

## หมายเหตุ
- [ ] ตรวจสอบ backend ว่ามี scheduled job จริงหรือไม่
- [ ] ปรับปรุง UI/UX ให้สอดคล้องกับ flow ทั้งหมด 