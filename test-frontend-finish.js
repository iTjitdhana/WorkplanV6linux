const fetch = require('node-fetch').default;

async function testFrontendFinish() {
  console.log('🧪 [TEST] ทดสอบ Frontend Finish Production...');
  
  const apiUrl = 'http://localhost:3101';
  const workplanId = 292;
  
  try {
    // ทดสอบเหมือน frontend
    console.log('\n🟡 [TEST] ทดสอบ PATCH request เหมือน frontend...');
    console.log('📤 API URL:', apiUrl);
    console.log('📤 Workplan ID:', workplanId);
    console.log('📤 Full URL:', `${apiUrl}/api/work-plans/${workplanId}/status`);
    
    const res = await fetch(`${apiUrl}/api/work-plans/${workplanId}/status`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      mode: 'cors',
      body: JSON.stringify({ status_id: 4 })
    });
    
    console.log('📊 Response status:', res.status);
    console.log('📊 Response ok:', res.ok);
    console.log('📊 Response headers:', res.headers);
    
    const result = await res.json();
    console.log('✅ Response data:', result);
    
    if (!res.ok || !result.success) {
      console.error('❌ API error:', result);
      throw new Error(result.message || "API error");
    }
    
    console.log('✅ Success!');
    
  } catch (error) {
    console.error('🔴 [TEST] Error:', error);
    console.error('🔴 [TEST] Error name:', error.name);
    console.error('🔴 [TEST] Error message:', error.message);
  }
}

testFrontendFinish(); 