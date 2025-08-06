// ทดสอบ API แบบง่าย
const http = require('http');

function testAPI() {
  console.log('🧪 Testing Reports API...');
  
  const options = {
    hostname: 'localhost',
    port: 3101,
    path: '/api/reports/production-analysis?limit=10000',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.success) {
          console.log('✅ API Test Successful!');
          console.log('📊 Summary:');
          console.log('   Total Jobs:', response.data.summary.total_jobs);
          console.log('   Completed Jobs:', response.data.summary.completed_jobs);
          console.log('   In Progress:', response.data.summary.in_progress_jobs);
          console.log('   Not Started:', response.data.summary.not_started_jobs);
          console.log('   Completion Rate:', response.data.summary.completion_rate + '%');
          
          console.log('\n📈 Job Statistics:');
          console.log('   Total Job Types:', response.data.job_statistics?.length || 0);
          
          if (response.data.job_statistics && response.data.job_statistics.length > 0) {
            console.log('\n🏆 Top 5 Jobs:');
            response.data.job_statistics.slice(0, 5).forEach((job, index) => {
              console.log(`   ${index + 1}. ${job.job_name} (${job.job_code})`);
              console.log(`      Frequency: ${job.frequency}, Completed: ${job.total_completed}`);
            });
          }
          
          console.log('\n🎯 Time Variance Jobs:', response.data.time_variance_jobs?.length || 0);
          
        } else {
          console.log('❌ API Test Failed:', response.message);
        }
      } catch (error) {
        console.log('❌ JSON Parse Error:', error.message);
        console.log('Raw response:', data.substring(0, 500));
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request Error:', error.message);
  });

  req.end();
}

// เรียกใช้ทดสอบ
testAPI();