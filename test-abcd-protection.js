const fetch = require('node-fetch').default;

async function testABCDProtection() {
  console.log('🧪 [TEST] ทดสอบการป้องกันงาน A, B, C, D...');
  
  // ทดสอบ sync drafts
  const testData = {
    targetDate: "2025-07-29"
  };
  
  try {
    console.log('🟡 [TEST] ทดสอบ sync drafts (ควรกรองออก A, B, C, D):');
    console.log('🟡 [TEST] ข้อมูล:', testData);
    
    const response = await fetch('http://localhost:3101/api/work-plans/sync-drafts-to-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    console.log('🟡 [TEST] Response status:', response.status);
    const result = await response.text();
    console.log('🟢 [TEST] Response:', result);
    
    if (response.ok) {
      console.log('✅ [TEST] การทดสอบสำเร็จ!');
      console.log('✅ [TEST] งาน A, B, C, D ควรจะไม่ถูก sync ไป work_plans');
    } else {
      console.log('❌ [TEST] การทดสอบล้มเหลว!');
    }
    
  } catch (error) {
    console.error('🔴 [TEST] Error:', error.message);
  }
}

testABCDProtection(); 