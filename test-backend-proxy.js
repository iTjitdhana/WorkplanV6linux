const fetch = require('node-fetch').default;

async function testBackendProxy() {
  console.log('🧪 [TEST] ทดสอบการเชื่อมต่อผ่าน Backend Proxy...');
  
  const testData = {
    sheetName: "1.ใบสรุปงาน v.4",
    rows: [
      [1, "TEST001", "งานทดสอบ", "ผู้ทดสอบ", "", "", "", "09:00", "10:00", "เครื่องทดสอบ", "ห้องทดสอบ", "หมายเหตุทดสอบ"]
    ],
    clearSheet: true
  };
  
  try {
    console.log('🟡 [TEST] ส่งข้อมูลทดสอบผ่าน backend proxy:', testData);
    
    const response = await fetch('http://localhost:3101/api/send-to-google-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    console.log('🟡 [TEST] Response status:', response.status);
    console.log('🟡 [TEST] Response ok:', response.ok);
    
    const result = await response.text();
    console.log('🟢 [TEST] Backend proxy response:', result);
    
    if (response.ok) {
      console.log('✅ [TEST] การเชื่อมต่อผ่าน Backend Proxy สำเร็จ!');
    } else {
      console.log('❌ [TEST] การเชื่อมต่อผ่าน Backend Proxy ล้มเหลว!');
    }
    
  } catch (error) {
    console.error('🔴 [TEST] Error:', error.message);
    console.log('💡 [HINT] ตรวจสอบว่า backend server รันอยู่ที่ port 3101 หรือไม่');
  }
}

testBackendProxy(); 