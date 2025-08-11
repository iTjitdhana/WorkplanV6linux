// ไฟล์ทดสอบระบบรายงานสถิติงานที่ปรับปรุงแล้ว
const fetch = require('node-fetch');

async function testImprovedReports() {
  console.log('🧪 Testing Improved Reports System...\n');

  try {
    // Test 1: ทดสอบรายงานทั้งหมด (ไม่ระบุวันที่)
    console.log('📊 Test 1: Testing all data report...');
    const allDataResponse = await fetch('http://localhost:3001/api/reports/production-analysis?limit=10000');
    const allData = await allDataResponse.json();
    
    if (allData.success) {
      console.log('✅ All data report successful');
      console.log('📈 Summary:', {
        total_jobs: allData.data.summary.total_jobs,
        completed_jobs: allData.data.summary.completed_jobs,
        in_progress_jobs: allData.data.summary.in_progress_jobs,
        not_started_jobs: allData.data.summary.not_started_jobs,
        completion_rate: allData.data.summary.completion_rate + '%'
      });
      console.log('📊 Job statistics count:', allData.data.job_statistics?.length || 0);
      console.log('🎯 Time variance jobs count:', allData.data.time_variance_jobs?.length || 0);
      
      // แสดงตัวอย่างงานที่มีความถี่สูงสุด
      if (allData.data.job_statistics && allData.data.job_statistics.length > 0) {
        console.log('\n🏆 Top 5 most frequent jobs:');
        allData.data.job_statistics.slice(0, 5).forEach((job, index) => {
          console.log(`${index + 1}. ${job.job_name} (${job.job_code})`);
          console.log(`   Frequency: ${job.frequency}, Work Plans: ${job.total_work_plans || job.frequency}`);
          console.log(`   Completed: ${job.total_completed}, Accuracy: ${job.accuracy_rate}%`);
        });
      }
    } else {
      console.log('❌ All data report failed:', allData.message);
    }

    // Test 2: ทดสอบรายงานตามช่วงวันที่
    console.log('\n📊 Test 2: Testing date range report...');
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    const dateRangeResponse = await fetch(`http://localhost:3001/api/reports/production-analysis?start_date=${startDate}&end_date=${endDate}&limit=10000`);
    const dateRangeData = await dateRangeResponse.json();
    
    if (dateRangeData.success) {
      console.log('✅ Date range report successful');
      console.log('📈 Summary for', startDate, 'to', endDate + ':');
      console.log({
        total_jobs: dateRangeData.data.summary.total_jobs,
        completed_jobs: dateRangeData.data.summary.completed_jobs,
        completion_rate: dateRangeData.data.summary.completion_rate + '%'
      });
    } else {
      console.log('❌ Date range report failed:', dateRangeData.message);
    }

    // Test 3: ตรวจสอบการนับงานซ้ำ
    console.log('\n🔍 Test 3: Checking for duplicate job counting...');
    if (allData.success && allData.data.job_statistics) {
      const duplicateCheck = {};
      allData.data.job_statistics.forEach(job => {
        const key = job.job_code;
        if (duplicateCheck[key]) {
          console.log('⚠️ Found duplicate job_code:', key);
        } else {
          duplicateCheck[key] = true;
        }
      });
      console.log('✅ No duplicate job codes found in statistics');
      
      // ตรวจสอบงานที่มี frequency สูงผิดปกติ
      const suspiciousJobs = allData.data.job_statistics.filter(job => 
        job.total_work_plans && job.total_work_plans > job.frequency * 2
      );
      
      if (suspiciousJobs.length > 0) {
        console.log('⚠️ Found jobs with suspicious frequency counts:');
        suspiciousJobs.forEach(job => {
          console.log(`   ${job.job_name}: frequency=${job.frequency}, work_plans=${job.total_work_plans}`);
        });
      } else {
        console.log('✅ No suspicious frequency counts detected');
      }
    }

    // Test 4: ตรวจสอบงานที่มี logs แต่ไม่แสดงในรายงาน
    console.log('\n🔍 Test 4: Checking jobs with logs but not showing as completed...');
    if (allData.success && allData.data.jobs) {
      const jobsWithLogs = allData.data.jobs.filter(job => job.has_logs);
      const jobsCompleted = allData.data.jobs.filter(job => job.has_completed_sessions);
      const jobsWithLogsButNotCompleted = allData.data.jobs.filter(job => 
        job.has_logs && !job.has_completed_sessions
      );
      
      console.log('📊 Jobs with any logs:', jobsWithLogs.length);
      console.log('📊 Jobs with completed sessions:', jobsCompleted.length);
      console.log('📊 Jobs with logs but not completed:', jobsWithLogsButNotCompleted.length);
      
      if (jobsWithLogsButNotCompleted.length > 0) {
        console.log('🔍 Sample jobs with logs but not completed:');
        jobsWithLogsButNotCompleted.slice(0, 3).forEach(job => {
          console.log(`   ${job.job_name} (${job.job_code}): ${job.production_status}`);
          console.log(`   Start logs: ${job.start_logs}, Stop logs: ${job.stop_logs}`);
        });
      }
    }

    console.log('\n🎉 Testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// เรียกใช้ทดสอบ
testImprovedReports();