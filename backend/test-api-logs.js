const fetch = require('node-fetch');

async function testLogsAPI() {
  console.log('🔍 Testing Logs API...');
  
  try {
    // ทดสอบ GET /api/logs
    console.log('📡 Testing GET /api/logs...');
    const response = await fetch('http://192.168.0.94:3102/api/logs');
    
    if (!response.ok) {
      console.log(`❌ API responded with status: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:');
    console.log('   Success:', data.success);
    console.log('   Data type:', Array.isArray(data.data) ? 'Array' : typeof data.data);
    console.log('   Data length:', Array.isArray(data.data) ? data.data.length : 'N/A');
    
    if (Array.isArray(data.data) && data.data.length > 0) {
      console.log('📋 Sample log entry:');
      console.log(JSON.stringify(data.data[0], null, 2));
      
      console.log('📊 Logs summary:');
      console.log(`   Total logs: ${data.data.length}`);
      
      // นับตาม status
      const statusCount = {};
      data.data.forEach(log => {
        statusCount[log.status] = (statusCount[log.status] || 0) + 1;
      });
      console.log('   Status breakdown:', statusCount);
      
      // นับตาม work_plan_id
      const workPlanCount = {};
      data.data.forEach(log => {
        const wpId = log.work_plan_id || 'NULL';
        workPlanCount[wpId] = (workPlanCount[wpId] || 0) + 1;
      });
      console.log('   Work plan breakdown (top 5):', 
        Object.entries(workPlanCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
      );
      
    } else {
      console.log('⚠️ No logs data found');
    }
    
  } catch (error) {
    console.log('❌ Error testing API:', error.message);
  }
}

testLogsAPI();

