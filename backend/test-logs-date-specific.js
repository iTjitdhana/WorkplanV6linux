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

async function testLogsDateSpecific() {
  console.log('🔍 Testing Logs for specific dates...');
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!');
    
    // ตรวจสอบข้อมูลวันที่ 28 สิงหาคม 2025
    console.log('📅 Checking logs for 2025-08-28...');
    const [logs28] = await connection.execute(`
      SELECT id, work_plan_id, process_number, status, timestamp 
      FROM logs 
      WHERE DATE(timestamp) = '2025-08-28'
      ORDER BY timestamp DESC
      LIMIT 20
    `);
    
    console.log(`📊 Found ${logs28.length} logs for 2025-08-28`);
    if (logs28.length > 0) {
      console.log('📋 Logs for 2025-08-28:');
      logs28.forEach((log, index) => {
        console.log(`   ${index + 1}. ID: ${log.id}, WP: ${log.work_plan_id}, Process: ${log.process_number}, Status: ${log.status}, Time: ${log.timestamp}`);
      });
    }
    
    // ตรวจสอบข้อมูลวันที่ 27 สิงหาคม 2025
    console.log('\n📅 Checking logs for 2025-08-27...');
    const [logs27] = await connection.execute(`
      SELECT id, work_plan_id, process_number, status, timestamp 
      FROM logs 
      WHERE DATE(timestamp) = '2025-08-27'
      ORDER BY timestamp DESC
      LIMIT 10
    `);
    
    console.log(`📊 Found ${logs27.length} logs for 2025-08-27`);
    if (logs27.length > 0) {
      console.log('📋 Sample logs for 2025-08-27:');
      logs27.slice(0, 5).forEach((log, index) => {
        console.log(`   ${index + 1}. ID: ${log.id}, WP: ${log.work_plan_id}, Process: ${log.process_number}, Status: ${log.status}, Time: ${log.timestamp}`);
      });
    }
    
    // ตรวจสอบข้อมูลล่าสุด 10 รายการ
    console.log('\n📅 Checking latest 10 logs...');
    const [latestLogs] = await connection.execute(`
      SELECT id, work_plan_id, process_number, status, timestamp, DATE(timestamp) as log_date
      FROM logs 
      ORDER BY timestamp DESC
      LIMIT 10
    `);
    
    console.log('📋 Latest 10 logs:');
    latestLogs.forEach((log, index) => {
      console.log(`   ${index + 1}. ID: ${log.id}, Date: ${log.log_date}, Time: ${log.timestamp}, WP: ${log.work_plan_id}, Process: ${log.process_number}, Status: ${log.status}`);
    });
    
    // ตรวจสอบช่วงวันที่ที่มีข้อมูล
    console.log('\n📅 Checking date range...');
    const [dateRange] = await connection.execute(`
      SELECT 
        MIN(DATE(timestamp)) as earliest_date,
        MAX(DATE(timestamp)) as latest_date,
        COUNT(*) as total_logs
      FROM logs
    `);
    
    console.log('📊 Date range analysis:');
    console.log(`   Earliest date: ${dateRange[0].earliest_date}`);
    console.log(`   Latest date: ${dateRange[0].latest_date}`);
    console.log(`   Total logs: ${dateRange[0].total_logs}`);
    
    await connection.end();
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testLogsDateSpecific();

