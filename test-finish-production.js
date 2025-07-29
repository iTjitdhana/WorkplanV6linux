const fetch = require('node-fetch').default;

async function testFinishProduction() {
  console.log('🧪 [TEST] ทดสอบฟังก์ชันจบงานผลิต...');
  
  const apiUrl = 'http://localhost:3101';
  
  try {
    // 1. ดึง work plans
    console.log('\n🟡 [TEST] 1. ดึง work plans...');
    const workplansRes = await fetch(`${apiUrl}/api/work-plans?date=2025-07-29`);
    const workplansData = await workplansRes.json();
    
    if (!workplansData.data || workplansData.data.length === 0) {
      console.log('⚠️ ไม่มี work plans สำหรับวันที่ 2025-07-29');
      return;
    }
    
    const workplan = workplansData.data[0];
    console.log('📋 Selected workplan:', {
      id: workplan.id,
      job_name: workplan.job_name,
      status_name: workplan.status_name
    });
    
    // 2. ทดสอบอัปเดตสถานะเป็น "เสร็จสิ้น"
    console.log('\n🟡 [TEST] 2. อัปเดตสถานะเป็น "เสร็จสิ้น"...');
    
    const updateRes = await fetch(`${apiUrl}/api/work-plans/${workplan.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status_id: 4 }) // 4 = เสร็จสิ้น
    });
    
    const updateData = await updateRes.json();
    console.log('✅ Update status response:', updateData);
    
    if (updateData.success) {
      // 3. ตรวจสอบสถานะใหม่
      console.log('\n🟡 [TEST] 3. ตรวจสอบสถานะใหม่...');
      const checkRes = await fetch(`${apiUrl}/api/work-plans?date=2025-07-29`);
      const checkData = await checkRes.json();
      
      const updatedWorkplan = checkData.data.find((wp) => wp.id === workplan.id);
      if (updatedWorkplan) {
        console.log('✅ Updated workplan status:', {
          id: updatedWorkplan.id,
          job_name: updatedWorkplan.job_name,
          status_name: updatedWorkplan.status_name,
          status_color: updatedWorkplan.status_color
        });
      }
    }
    
  } catch (error) {
    console.error('🔴 [TEST] Error:', error.message);
  }
}

testFinishProduction(); 