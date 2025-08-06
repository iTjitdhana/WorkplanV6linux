@echo off
echo ========================================
echo เริ่มระบบและทดสอบรายงาน
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
  samples.forEach(row => {
    const date = new Date(row.production_date).toLocaleDateString('th-TH');
    console.log('   -', row.job_code, ':', row.job_name, '(', date, ')');
  });
  process.exit(0);
}).catch(err => {
  console.error('❌ ข้อผิดพลาด:', err.message);
  process.exit(1);
});
"

echo.
echo 2. เริ่ม backend server...
start "Backend Server" cmd /k "cd backend && npm start"

echo.
echo 3. รอ 5 วินาที...
timeout /t 5 /nobreak > nul

echo.
echo 4. เริ่ม frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo 5. รอ 10 วินาที...
timeout /t 10 /nobreak > nul

echo.
echo 6. ทดสอบ API endpoint...
curl -s "http://localhost:3101/api/reports/production-analysis" | node -e "
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
      if (result.data.job_statistics && result.data.job_statistics.length > 0) {
        console.log('   Sample job:', result.data.job_statistics[0].job_name);
      }
    }
  } catch (e) {
    console.log('❌ Error parsing response:', e.message);
  }
});
"

echo.
echo 7. เปิดเบราว์เซอร์...
start http://localhost:3000/reports

echo.
echo ========================================
echo ระบบเริ่มทำงานแล้ว!
echo ========================================
echo.
echo Backend: http://localhost:3101
echo Frontend: http://localhost:3000
echo Reports: http://localhost:3000/reports
echo.
echo กด Enter เพื่อปิดหน้าต่างนี้...
pause > nul 