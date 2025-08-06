@echo off
echo เพิ่มสถานะ "กำลังดำเนินการ" ในฐานข้อมูล...
mysql -u root -p esp_tracker < add_production_status.sql
echo เสร็จสิ้น!
pause 