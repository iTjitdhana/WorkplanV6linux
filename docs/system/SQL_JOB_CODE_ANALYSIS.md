# SQL Queries สำหรับการวิเคราะห์ Job Code

## ไฟล์ SQL ที่มีให้

### 1. `simple_job_code_check.sql` - การตรวจสอบเบื้องต้น
ใช้สำหรับการตรวจสอบข้อมูล job_code แบบง่ายๆ

#### Query ที่มี:
1. **จำนวน job_code ที่ไม่ซ้ำ**
   ```sql
   SELECT COUNT(DISTINCT job_code) as unique_job_codes
   FROM esp_tracker_empty.work_plans 
   WHERE job_code IS NOT NULL AND job_code != '';
   ```

2. **แสดง job_code และจำนวนครั้งที่ปรากฏ**
   ```sql
   SELECT 
       job_code,
       job_name,
       COUNT(*) as frequency
   FROM esp_tracker_empty.work_plans 
   WHERE job_code IS NOT NULL AND job_code != ''
   GROUP BY job_code, job_name
   ORDER BY frequency DESC;
   ```

3. **Top 20 job_code ที่ผลิตบ่อยที่สุด**
   ```sql
   SELECT 
       job_code,
       job_name,
       COUNT(*) as frequency
   FROM esp_tracker_empty.work_plans 
   WHERE job_code IS NOT NULL AND job_code != ''
   GROUP BY job_code, job_name
   ORDER BY frequency DESC
   LIMIT 20;
   ```

### 2. `check_unique_job_codes.sql` - การวิเคราะห์ละเอียด
ใช้สำหรับการวิเคราะห์ข้อมูล job_code แบบครบถ้วน

#### Query ที่มี:
1. **จำนวน job_code ที่ไม่ซ้ำทั้งหมด**
2. **รายการ job_code พร้อมข้อมูลเพิ่มเติม**
3. **สรุปสถิติการกระจาย**
4. **Top 10 job_code ที่ผลิตบ่อยที่สุด**
5. **job_code ที่ผลิตเพียงครั้งเดียว**
6. **ตรวจสอบ job_code ที่มีปัญหา**
7. **สถิติตามช่วงความถี่**

## วิธีการใช้งาน

### 1. ใช้กับ MySQL Workbench
1. เปิด MySQL Workbench
2. เชื่อมต่อกับฐานข้อมูล esp_tracker_empty
3. เปิดไฟล์ SQL ที่ต้องการ
4. รัน query ที่ต้องการ

### 2. ใช้กับ Command Line
```bash
mysql -u username -p esp_tracker_empty < simple_job_code_check.sql
```

### 3. ใช้กับ phpMyAdmin
1. เข้าไปที่ phpMyAdmin
2. เลือกฐานข้อมูล esp_tracker_empty
3. ไปที่แท็บ SQL
4. Copy และ paste query ที่ต้องการ
5. กด Execute

## ผลลัพธ์ที่คาดหวัง

### จาก Query แรก (จำนวน job_code ที่ไม่ซ้ำ)
```
+-------------------+
| unique_job_codes  |
+-------------------+
| 150               |
+-------------------+
```

### จาก Query ที่สอง (รายการ job_code)
```
+----------+------------------------+-----------+
| job_code | job_name              | frequency |
+----------+------------------------+-----------+
| 235265   | พริกแกงส้ม สูตร 2      | 17        |
| 235016   | น้ำพริกลงเรือ          | 16        |
| 235014   | น้ำจิ้มหมูสะเต๊ะ       | 14        |
| ...      | ...                   | ...       |
+----------+------------------------+-----------+
```

## การแปลผล

### 1. จำนวน job_code ที่ไม่ซ้ำ
- แสดงจำนวนประเภทงานที่แตกต่างกันในระบบ
- ใช้เป็นข้อมูลพื้นฐานสำหรับการวางแผน

### 2. ความถี่การผลิต
- **สูงมาก (≥20 ครั้ง)**: งานที่ผลิตเป็นประจำ
- **สูง (10-19 ครั้ง)**: งานที่ผลิตบ่อย
- **ปานกลาง (5-9 ครั้ง)**: งานที่ผลิตเป็นครั้งคราว
- **ต่ำ (2-4 ครั้ง)**: งานที่ผลิตไม่บ่อย
- **ครั้งเดียว (1 ครั้ง)**: งานที่ผลิตเฉพาะกิจ

### 3. การใช้งานในการวางแผน
- ระบุงานที่ต้องผลิตบ่อย
- วางแผนกำลังการผลิต
- จัดลำดับความสำคัญของงาน
- วิเคราะห์แนวโน้มการผลิต

## หมายเหตุ

- ตรวจสอบให้แน่ใจว่าเชื่อมต่อกับฐานข้อมูลที่ถูกต้อง
- Query เหล่านี้ใช้กับตาราง `esp_tracker_empty.work_plans`
- หากต้องการใช้กับตารางอื่น ให้เปลี่ยนชื่อตารางใน query
- ข้อมูลที่ได้จะขึ้นอยู่กับข้อมูลที่มีในฐานข้อมูล 