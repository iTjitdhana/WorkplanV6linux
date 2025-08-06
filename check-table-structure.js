// ตรวจสอบโครงสร้างตาราง work_plans
const { pool } = require('./backend/config/database');

async function checkTableStructure() {
  try {
    console.log('🔍 Checking work_plans table structure...');
    
    // ตรวจสอบคอลัมน์ในตาราง
    const [columns] = await pool.execute('DESCRIBE work_plans');
    console.log('📋 work_plans columns:');
    columns.forEach(col => {
      console.log(`   ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // ตรวจสอบข้อมูลตัวอย่าง
    const [sample] = await pool.execute('SELECT * FROM work_plans LIMIT 3');
    console.log('\n📊 Sample data count:', sample.length);
    
    if (sample.length > 0) {
      console.log('📊 Available columns in data:', Object.keys(sample[0]));
      console.log('📊 Sample record:');
      console.log(JSON.stringify(sample[0], null, 2));
    }
    
    // ตรวจสอบจำนวนข้อมูลทั้งหมด
    const [count] = await pool.execute('SELECT COUNT(*) as total FROM work_plans');
    console.log('\n📈 Total records:', count[0].total);
    
    // ตรวจสอบข้อมูลที่มี job_code และ job_name
    const [validData] = await pool.execute(`
      SELECT COUNT(*) as valid_count 
      FROM work_plans 
      WHERE job_code IS NOT NULL 
        AND job_code != '' 
        AND job_name IS NOT NULL 
        AND job_name != ''
    `);
    console.log('✅ Valid records (with job_code and job_name):', validData[0].valid_count);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTableStructure();