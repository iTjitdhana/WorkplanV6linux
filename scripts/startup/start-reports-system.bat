@echo off
echo ========================================
echo เริ่มระบบรายงานและตรวจสอบข้อมูล
echo ========================================

echo.
echo 1. ตรวจสอบการเชื่อมต่อฐานข้อมูล...
cd backend
node -e "
const { pool } = require('./config/database');
pool.execute('SELECT COUNT(*) as count FROM work_plans')
  .then(([rows]) => {
    console.log('✅ จำนวนงานในระบบ:', rows[0].count);
    return pool.execute('SELECT COUNT(*) as count FROM logs');
  })
  .then(([rows]) => {
    console.log('✅ จำนวน logs ในระบบ:', rows[0].count);
    process.exit(0);
  })
  .catch(err => {
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
echo 6. เปิดเบราว์เซอร์...
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