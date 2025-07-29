const fetch = require('node-fetch').default;

async function testStatusEndpoint() {
  console.log('🧪 [TEST] ทดสอบ API endpoint สำหรับอัปเดตสถานะ...');
  
  const apiUrl = 'http://localhost:3101';
  const workplanId = 292; // ใช้ ID จาก debug logs
  
  try {
    // 1. ทดสอบ GET work plan ก่อน
    console.log('\n🟡 [TEST] 1. ทดสอบ GET work plan...');
    const getRes = await fetch(`${apiUrl}/api/work-plans/${workplanId}`);
    const getData = await getRes.json();
    console.log('✅ GET response:', getData);
    
    if (!getData.success) {
      console.log('❌ GET failed, workplan not found');
      return;
    }
    
    // 2. ทดสอบ PATCH status
    console.log('\n🟡 [TEST] 2. ทดสอบ PATCH status...');
    console.log('📤 Sending PATCH request to:', `${apiUrl}/api/work-plans/${workplanId}/status`);
    console.log('📤 Request body:', { status_id: 4 });
    
    const patchRes = await fetch(`${apiUrl}/api/work-plans/${workplanId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ status_id: 4 })
    });
    
    console.log('📊 Response status:', patchRes.status);
    console.log('📊 Response ok:', patchRes.ok);
    
    const patchData = await patchRes.json();
    console.log('✅ PATCH response:', patchData);
    
    if (patchRes.ok && patchData.success) {
      // 3. ตรวจสอบสถานะใหม่
      console.log('\n🟡 [TEST] 3. ตรวจสอบสถานะใหม่...');
      const checkRes = await fetch(`${apiUrl}/api/work-plans/${workplanId}`);
      const checkData = await checkRes.json();
      console.log('✅ Updated workplan:', checkData);
    }
    
  } catch (error) {
    console.error('🔴 [TEST] Error:', error.message);
    console.error('🔴 [TEST] Error details:', error);
  }
}

testStatusEndpoint(); 