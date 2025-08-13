const fetch = require('node-fetch');

async function testDailySummary() {
  try {
    console.log('Testing Daily Summary API...');
    
    const response = await fetch('http://localhost:3000/api/logs/daily-summary?productionDate=2025-01-15');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('\n=== Summary ===');
      console.log('Total jobs:', data.data.totalJobs);
      console.log('Completed jobs:', data.data.completedJobs);
      console.log('In progress jobs:', data.data.inProgressJobs);
      console.log('Not started jobs:', data.data.notStartedJobs);
      
      console.log('\n=== Job Details ===');
      data.data.jobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.jobName} (${job.jobCode})`);
        console.log(`   Status: ${job.status}`);
        console.log(`   Planned: ${job.plannedDurationMinutes} minutes`);
        console.log(`   Actual: ${job.actualDurationMinutes} minutes`);
        console.log(`   Variance: ${job.timeVarianceMinutes} minutes`);
        console.log(`   Processes: ${job.completedProcesses}/${job.totalProcesses}`);
        console.log(`   Matching Work Plan ID: ${job.matchingWorkPlanId}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testDailySummary();
