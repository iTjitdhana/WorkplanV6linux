const fetch = require('node-fetch').default;

async function testSheetName() {
  console.log('🧪 [TEST] ทดสอบชื่อ sheet ที่ถูกต้อง...');
  
  // ทดสอบชื่อ sheet ที่ถูกต้อง
  const correctSheetName = "รายงาน-เวลาผู้ปฏิบัติงาน";
  console.log('🟡 [TEST] Correct sheet name:', correctSheetName);
  console.log('🟡 [TEST] Sheet name length:', correctSheetName.length);
  console.log('🟡 [TEST] Sheet name bytes:', Buffer.from(correctSheetName).toString('hex'));
  
  const testData = {
    sheetName: correctSheetName,
    "Date Value": "29/07/2025"
  };
  
  try {
    console.log('🟡 [TEST] ส่งข้อมูลทดสอบ:', testData);
    
    const response = await fetch('http://localhost:3101/api/send-to-google-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    console.log('🟡 [TEST] Response status:', response.status);
    const result = await response.text();
    console.log('🟢 [TEST] Response:', result);
    
    if (response.ok) {
      console.log('✅ [TEST] การทดสอบสำเร็จ!');
    } else {
      console.log('❌ [TEST] การทดสอบล้มเหลว!');
    }
    
  } catch (error) {
    console.error('🔴 [TEST] Error:', error.message);
  }
}

testSheetName(); 