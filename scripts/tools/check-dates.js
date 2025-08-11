// ตรวจสอบวันที่ในฐานข้อมูล
const { pool } = require('./backend/config/database');

async function checkDates() {
  try {
    console.log('🔍 Checking production dates in database...');
    
    // ตรวจสอบวันที่ที่มีในฐานข้อมูล
    const [dates] = await pool.execute(`
      SELECT 
        DATE_FORMAT(production_date, '%Y-%m-%d') as formatted_date,
        COUNT(*) as count
      FROM work_plans 
      GROUP BY DATE_FORMAT(production_date, '%Y-%m-%d')
      ORDER BY formatted_date DESC
      LIMIT 10
    `);
    
    console.log('📅 Available dates in database:');
    dates.forEach(row => {
      console.log(`   ${row.formatted_date}: ${row.count} records`);
    });
    
    // ทดสอบ query ที่ไม่มีการกรองวันที่
    const [allData] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM work_plans wp
      WHERE wp.job_code IS NOT NULL 
        AND wp.job_code != ''
        AND wp.job_name IS NOT NULL 
        AND wp.job_name != ''
    `);
    
    console.log('\n📊 Total valid records (no date filter):', allData[0].total);
    
    // ทดสอบ query กับวันที่ที่มีจริง
    if (dates.length > 0) {
      const testDate = dates[0].formatted_date;
      console.log(`\n🧪 Testing with actual date: ${testDate}`);
      
      const [testResult] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM work_plans wp
        WHERE wp.job_code IS NOT NULL 
          AND wp.job_code != ''
          AND wp.job_name IS NOT NULL 
          AND wp.job_name != ''
          AND DATE_FORMAT(wp.production_date, '%Y-%m-%d') = ?
      `, [testDate]);
      
      console.log(`📊 Records for ${testDate}:`, testResult[0].count);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDates();