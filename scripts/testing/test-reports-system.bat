@echo off
echo ========================================
echo ทดสอบระบบรายงาน
echo ========================================

echo.
echo 1. ตรวจสอบข้อมูลในฐานข้อมูล...
cd backend
node -e "
const { pool } = require('./config/database');
Promise.all([
  pool.execute('SELECT COUNT(*) as count FROM work_plans'),
  pool.execute('SELECT COUNT(*) as count FROM logs'),
  pool.execute('SELECT job_code, job_name, production_date FROM work_plans WHERE job_code IS NOT NULL LIMIT 3')
]).then(([[workPlans], [logs], [samples]]) => {
  console.log('✅ จำนวนงานในระบบ:', workPlans[0].count);
  console.log('✅ จำนวน logs ในระบบ:', logs[0].count);
  console.log('✅ ข้อมูลงานตัวอย่าง:');
  samples.forEach(row => console.log('   -', row.job_code, ':', row.job_name, '(', row.production_date, ')'));
  process.exit(0);
}).catch(err => {
  console.error('❌ ข้อผิดพลาด:', err.message);
  process.exit(1);
});
"

echo.
echo 2. ทดสอบ API endpoint...
timeout /t 3 /nobreak > nul
curl -s "http://localhost:3101/api/reports/production-analysis" | node -e "
const fs = require('fs');
let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  try {
    const result = JSON.parse(data);
    console.log('✅ API Response:');
    console.log('   Success:', result.success);
    if (result.data) {
      console.log('   Total jobs:', result.data.summary?.total_jobs || 0);
      console.log('   Job statistics:', result.data.job_statistics?.length || 0);
    }
  } catch (e) {
    console.log('❌ Error parsing response:', e.message);
  }
});
"

echo.
echo 3. เปิดเบราว์เซอร์...
start http://localhost:3000/reports

echo.
echo ========================================
echo การทดสอบเสร็จสิ้น!
echo ========================================
echo.
echo Backend: http://localhost:3101
echo Frontend: http://localhost:3000
echo Reports: http://localhost:3000/reports
echo.
echo กด Enter เพื่อปิดหน้าต่างนี้...
pause > nul 