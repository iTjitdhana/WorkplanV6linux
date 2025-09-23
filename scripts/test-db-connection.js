const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  try {
    console.log('Testing connection to 192.168.0.93...');
    
    const connection = await mysql.createConnection({
      host: '192.168.0.93',
      user: 'it.jitdhana',
      password: 'iT12345$',
      database: 'esp_tracker',
    });

    console.log('✅ Connected to database 192.168.0.93');

    // ตรวจสอบตาราง work_plans
    const [workPlans] = await connection.execute('SELECT COUNT(*) as count FROM work_plans');
    console.log(`📊 Total work_plans: ${workPlans[0].count}`);

    // ดูตัวอย่าง job_code ที่มี
    const [sampleJobs] = await connection.execute(`
      SELECT job_code, job_name, production_date 
      FROM work_plans 
      ORDER BY production_date DESC 
      LIMIT 5
    `);
    console.log('📋 Sample job_codes:');
    sampleJobs.forEach(job => {
      console.log(`  - ${job.job_code}: ${job.job_name} (${job.production_date})`);
    });

    // ตรวจสอบตาราง logs
    const [logs] = await connection.execute('SELECT COUNT(*) as count FROM logs');
    console.log(`📊 Total logs: ${logs[0].count}`);

    // ดูตัวอย่าง logs
    const [sampleLogs] = await connection.execute(`
      SELECT work_plan_id, process_number, status, timestamp 
      FROM logs 
      ORDER BY timestamp DESC 
      LIMIT 5
    `);
    console.log('📋 Sample logs:');
    sampleLogs.forEach(log => {
      console.log(`  - work_plan_id: ${log.work_plan_id}, process: ${log.process_number}, status: ${log.status}, time: ${log.timestamp}`);
    });

    await connection.end();
    console.log('✅ Test completed');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDatabaseConnection();
