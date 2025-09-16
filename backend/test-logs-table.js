const mysql = require('mysql2/promise');

const config = {
  host: '192.168.0.94',
  user: 'jitdhana',
  password: 'iT12345$',
  database: 'esp_tracker',
  port: 3306,
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000
};

async function testLogsTable() {
  console.log('🔧 Database Configuration:');
  console.log('   Host:', config.host);
  console.log('   User:', config.user);
  console.log('   Database:', config.database);
  console.log('   Port:', config.port);
  console.log('');
  
  try {
    console.log('🔍 Connecting to database...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!');
    
    // ตรวจสอบว่าตาราง logs มีอยู่หรือไม่
    console.log('📋 Checking if logs table exists...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'logs'");
    if (tables.length === 0) {
      console.log('❌ Table "logs" does not exist!');
      return;
    }
    console.log('✅ Table "logs" exists');
    
    // ดูโครงสร้างตาราง logs
    console.log('🏗️ Checking logs table structure...');
    const [columns] = await connection.execute("DESCRIBE logs");
    console.log('📊 Logs table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
    // นับจำนวน records ในตาราง logs
    console.log('📊 Counting records in logs table...');
    const [countResult] = await connection.execute("SELECT COUNT(*) as count FROM logs");
    console.log(`✅ Total logs records: ${countResult[0].count}`);
    
    // ดูข้อมูล logs ล่าสุด 10 รายการ
    if (countResult[0].count > 0) {
      console.log('📋 Recent logs (last 10):');
      const [recentLogs] = await connection.execute(`
        SELECT id, work_plan_id, process_number, status, timestamp 
        FROM logs 
        ORDER BY timestamp DESC 
        LIMIT 10
      `);
      
      recentLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. ID: ${log.id}, Work Plan: ${log.work_plan_id || 'NULL'}, Process: ${log.process_number}, Status: ${log.status}, Time: ${log.timestamp}`);
      });
    } else {
      console.log('⚠️ No logs found in the table');
    }
    
    // ตรวจสอบ work_plans table
    console.log('📋 Checking work_plans table...');
    const [workPlansCount] = await connection.execute("SELECT COUNT(*) as count FROM work_plans");
    console.log(`✅ Total work plans: ${workPlansCount[0].count}`);
    
    if (workPlansCount[0].count > 0) {
      const [recentWorkPlans] = await connection.execute(`
        SELECT id, job_code, job_name 
        FROM work_plans 
        ORDER BY id DESC 
        LIMIT 5
      `);
      console.log('📋 Recent work plans:');
      recentWorkPlans.forEach((wp, index) => {
        console.log(`   ${index + 1}. ID: ${wp.id}, Code: ${wp.job_code}, Name: ${wp.job_name}`);
      });
    }
    
    await connection.end();
    console.log('');
    console.log('🎉 Logs table test completed!');
    
  } catch (error) {
    console.log('❌ Error testing logs table:', error.message);
    console.log('');
    console.log('🔍 Error details:');
    console.log('   Code:', error.code);
    console.log('   Errno:', error.errno);
    console.log('   SQL State:', error.sqlState);
  }
}

testLogsTable();

