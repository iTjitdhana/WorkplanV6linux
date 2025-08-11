// ทดสอบระบบเวลาแนะนำแบบ Median
const http = require('http');

function testMedianRecommendation() {
  console.log('🧪 Testing Median-based Recommendation System...');
  
  const options = {
    hostname: 'localhost',
    port: 3101,
    path: '/api/reports/production-analysis?start_date=2025-07-24&end_date=2025-08-04&limit=10000',
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
        
        if (response.success && response.data.job_statistics) {
          console.log('✅ Median Recommendation System Test Successful!');
          
          const stats = response.data.job_statistics;
          
          console.log('\n📊 Comparison: Median vs Average Recommendations:');
          stats.slice(0, 10).forEach((job, index) => {
            const medianTime = job.recommended_time;
            const avgTime = job.avg_actual_duration;
            const difference = Math.abs(medianTime - avgTime);
            const percentDiff = avgTime > 0 ? Math.round((difference / avgTime) * 100) : 0;
            
            console.log(`\n${index + 1}. ${job.job_name} (${job.job_code})`);
            console.log(`   เวลาแนะนำใหม่ (Median): ${medianTime} นาที ★`);
            console.log(`   เวลาเฉลี่ย (เก่า): ${avgTime} นาที`);
            console.log(`   ความต่าง: ${difference} นาที (${percentDiff}%)`);
            console.log(`   เวลาเร็วสุด: ${job.best_time || 'N/A'} นาที`);
            console.log(`   เวลาช้าสุด: ${job.worst_time || 'N/A'} นาที`);
            console.log(`   ความแม่นยำ: ${job.accuracy_rate}% (${job.accuracy_level})`);
            console.log(`   ผู้ปฏิบัติงานดีสุด: ${job.best_time_operators || 'ไม่ระบุ'}`);
          });
          
          // แสดงงานที่ Median ต่างจาก Average มาก
          const significantDifferences = stats.filter(job => {
            const difference = Math.abs(job.recommended_time - job.avg_actual_duration);
            const percentDiff = job.avg_actual_duration > 0 ? (difference / job.avg_actual_duration) * 100 : 0;
            return percentDiff > 20; // ต่างกันมากกว่า 20%
          }).slice(0, 5);
          
          if (significantDifferences.length > 0) {
            console.log('\n🎯 Jobs with Significant Median vs Average Differences (>20%):');
            significantDifferences.forEach((job, index) => {
              const difference = Math.abs(job.recommended_time - job.avg_actual_duration);
              const percentDiff = Math.round((difference / job.avg_actual_duration) * 100);
              
              console.log(`${index + 1}. ${job.job_name}`);
              console.log(`   Median: ${job.recommended_time} min vs Average: ${job.avg_actual_duration} min`);
              console.log(`   Difference: ${percentDiff}% - Median is more accurate!`);
            });
          }
          
          // แสดงงานที่มีความแม่นยำสูงสุด
          const mostAccurate = stats
            .filter(job => job.accuracy_rate > 0)
            .sort((a, b) => b.accuracy_rate - a.accuracy_rate)
            .slice(0, 5);
          
          console.log('\n🏆 Most Accurate Time Recommendations:');
          mostAccurate.forEach((job, index) => {
            console.log(`${index + 1}. ${job.job_name}: ${job.accuracy_rate}% (${job.accuracy_level})`);
            console.log(`   Recommended time: ${job.recommended_time} minutes`);
            console.log(`   Best performers: ${job.best_time_operators}`);
          });
          
        } else {
          console.log('❌ Test Failed:', response.message || 'No job statistics found');
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
testMedianRecommendation();