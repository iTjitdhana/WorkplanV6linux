const fetch = require('node-fetch');

async function testLogsForFrontend() {
  console.log('🔍 Testing Logs for Frontend...');
  
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
    console.log('   Data length:', Array.isArray(data.data) ? data.data.length : 'N/A');
    
    if (Array.isArray(data.data) && data.data.length > 0) {
      const sampleLog = data.data[0];
      console.log('📋 Sample log structure:');
      console.log(JSON.stringify(sampleLog, null, 2));
      
      // ตรวจสอบฟิลด์ที่จำเป็นสำหรับ frontend
      console.log('🔍 Checking required fields for frontend:');
      const requiredFields = ['id', 'work_plan_id', 'process_number', 'status', 'timestamp', 'job_code', 'job_name'];
      const missingFields = [];
      
      requiredFields.forEach(field => {
        if (!(field in sampleLog)) {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        console.log('❌ Missing fields:', missingFields);
      } else {
        console.log('✅ All required fields present');
      }
      
      // ตรวจสอบข้อมูล timestamp
      console.log('🕐 Timestamp analysis:');
      const timestamps = data.data.slice(0, 5).map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        formatted: log.timestamp ? new Date(log.timestamp).toLocaleString('th-TH') : 'N/A'
      }));
      
      timestamps.forEach(ts => {
        console.log(`   ID ${ts.id}: ${ts.formatted}`);
      });
      
      // ตรวจสอบข้อมูล job
      console.log('📋 Job data analysis:');
      const jobs = data.data.slice(0, 5).map(log => ({
        id: log.id,
        job_code: log.job_code,
        job_name: log.job_name,
        work_plan_id: log.work_plan_id
      }));
      
      jobs.forEach(job => {
        console.log(`   ID ${job.id}: ${job.job_code} - ${job.job_name} (WP: ${job.work_plan_id})`);
      });
      
    } else {
      console.log('⚠️ No logs data found');
    }
    
  } catch (error) {
    console.log('❌ Error testing API:', error.message);
  }
}

testLogsForFrontend();

