const fetch = require('node-fetch');

async function testGoogleSheet() {
  console.log('🧪 [TEST] ทดสอบการเชื่อมต่อ Google Sheet...');
  
  const testData = {
    sheetName: "1.ใบสรุปงาน v.4",
    rows: [
      [1, "TEST001", "งานทดสอบ", "ผู้ทดสอบ", "", "", "", "09:00", "10:00", "เครื่องทดสอบ", "ห้องทดสอบ", "หมายเหตุทดสอบ"]
    ],
    clearSheet: true
  };
  
  try {
    console.log('🟡 [TEST] ส่งข้อมูลทดสอบ:', testData);
    
    const response = await fetch('https://script.google.com/macros/s/AKfycbxJ0u_K-ggpyOL2og9ZM8ungJrAwMWUhibsPOCzqy5Kjf_ybBXG8AplIUIvL0V9VNRO/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    console.log('🟡 [TEST] Response status:', response.status);
    console.log('🟡 [TEST] Response ok:', response.ok);
    
    const result = await response.text();
    console.log('🟢 [TEST] Google Sheet response:', result);
    
    if (response.ok) {
      console.log('✅ [TEST] การเชื่อมต่อ Google Sheet สำเร็จ!');
    } else {
      console.log('❌ [TEST] การเชื่อมต่อ Google Sheet ล้มเหลว!');
    }
    
  } catch (error) {
    console.error('🔴 [TEST] Error:', error.message);
  }
}

testGoogleSheet(); 