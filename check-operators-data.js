// ตรวจสอบข้อมูล operators
const { pool } = require('./backend/config/database');

async function checkOperatorsData() {
  try {
    console.log('🔍 Checking operators data...');
    
    // ตรวจสอบข้อมูล operators ในฐานข้อมูล
    const [sample] = await pool.execute(`
      SELECT 
        id, job_code, job_name, operators
      FROM work_plans 
      WHERE operators IS NOT NULL 
      LIMIT 5
    `);
    
    console.log('📊 Sample operators data:');
    sample.forEach((row, index) => {
      console.log(`${index + 1}. ${row.job_name} (${row.job_code})`);
      console.log(`   Operators raw: ${row.operators}`);
      console.log(`   Type: ${typeof row.operators}`);
      
      // ลองแปลง JSON
      try {
        if (typeof row.operators === 'string') {
          const parsed = JSON.parse(row.operators);
          console.log(`   Parsed: ${JSON.stringify(parsed)}`);
        } else {
          console.log(`   Direct value: ${JSON.stringify(row.operators)}`);
        }
      } catch (e) {
        console.log(`   Parse error: ${e.message}`);
      }
      console.log('');
    });
    
    // ตรวจสอบตาราง users
    console.log('👥 Checking users table...');
    const [users] = await pool.execute('SELECT id, name, id_code FROM users LIMIT 5');
    console.log('Available users:');
    users.forEach(user => {
      console.log(`   ${user.name} (ID: ${user.id}, Code: ${user.id_code})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkOperatorsData();