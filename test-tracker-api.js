const fetch = require('node-fetch').default;

async function testTrackerAPI() {
  console.log('🧪 [TEST] ทดสอบ Tracker API...');
  
  const apiUrl = 'http://localhost:3101';
  
  try {
    // 1. ทดสอบดึง work plans
    console.log('\n🟡 [TEST] 1. ทดสอบดึง work plans...');
    const workplansRes = await fetch(`${apiUrl}/api/work-plans?date=2025-07-29`);
    const workplansData = await workplansRes.json();
    console.log('✅ Work plans response:', workplansData);
    
    if (workplansData.data && workplansData.data.length > 0) {
      const workplan = workplansData.data[0];
      console.log('📋 Selected workplan:', workplan);
      
      // 2. ทดสอบดึง process steps
      console.log('\n🟡 [TEST] 2. ทดสอบดึง process steps...');
      const stepsRes = await fetch(`${apiUrl}/api/process-steps?job_code=${workplan.job_code}`);
      const stepsData = await stepsRes.json();
      console.log('✅ Process steps response:', stepsData);
      
      // 3. ทดสอบดึง logs
      console.log('\n🟡 [TEST] 3. ทดสอบดึง logs...');
      const logsRes = await fetch(`${apiUrl}/api/logs/work-plan/${workplan.id}`);
      const logsData = await logsRes.json();
      console.log('✅ Logs response:', logsData);
      
      // 4. ทดสอบสร้าง log
      if (stepsData.data && stepsData.data.length > 0) {
        const step = stepsData.data[0];
        console.log('\n🟡 [TEST] 4. ทดสอบสร้าง log (start)...');
        
        const logData = {
          work_plan_id: workplan.id,
          process_number: step.process_number,
          status: 'start',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };
        
        console.log('📤 Sending log data:', logData);
        
        const createLogRes = await fetch(`${apiUrl}/api/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });
        
        const createLogData = await createLogRes.json();
        console.log('✅ Create log response:', createLogData);
        
        if (createLogData.success) {
          // 5. ทดสอบดึง logs อีกครั้ง
          console.log('\n🟡 [TEST] 5. ทดสอบดึง logs หลังสร้าง...');
          const newLogsRes = await fetch(`${apiUrl}/api/logs/work-plan/${workplan.id}`);
          const newLogsData = await newLogsRes.json();
          console.log('✅ New logs response:', newLogsData);
        }
      }
    } else {
      console.log('⚠️ ไม่มี work plans สำหรับวันที่ 2025-07-29');
    }
    
  } catch (error) {
    console.error('🔴 [TEST] Error:', error.message);
  }
}

testTrackerAPI(); 