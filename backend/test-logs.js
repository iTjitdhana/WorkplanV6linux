const { pool } = require('./config/database');

async function testLogs() {
  try {
    console.log('🔍 Testing logs table connection...');
    
    // ทดสอบการเชื่อมต่อ
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM logs');
    console.log('📊 Total logs count:', rows[0].count);
    
    // ดูข้อมูล logs ทั้งหมด
    const [allLogs] = await pool.execute('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 10');
    console.log('📋 Recent logs:', allLogs);
    
    // ดู work_plan_ids ที่มีใน logs
    const [workPlanIds] = await pool.execute('SELECT DISTINCT work_plan_id FROM logs WHERE work_plan_id IS NOT NULL');
    console.log('🏷️ Work plan IDs in logs:', workPlanIds.map(row => row.work_plan_id));
    
    // ทดสอบ query ที่ใช้ใน getWorkPlanStatus
    if (workPlanIds.length > 0) {
      const testWorkPlanId = workPlanIds[0].work_plan_id;
      console.log(`🔍 Testing getWorkPlanStatus for work plan ID: ${testWorkPlanId}`);
      
      const [processRows] = await pool.execute(`
        SELECT 
          l.process_number,
          l.status,
          l.timestamp
        FROM logs l
        WHERE l.work_plan_id = ? AND l.id IN (
          SELECT MAX(id) FROM logs 
          WHERE work_plan_id = ? 
          GROUP BY process_number
        )
        ORDER BY l.process_number
      `, [testWorkPlanId, testWorkPlanId]);
      
      console.log(`📊 Process status for work plan ${testWorkPlanId}:`, processRows);
      
      const allProcessesStopped = processRows.length > 0 && processRows.every(row => row.status === 'stop');
      console.log(`✅ All processes stopped: ${allProcessesStopped}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing logs:', error);
  } finally {
    await pool.end();
  }
}

testLogs(); 