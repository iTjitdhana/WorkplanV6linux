const fetch = require('node-fetch').default;

async function testFixedData() {
  console.log('🧪 [TEST] ทดสอบข้อมูลที่แก้ไขแล้ว...');
  
  // ทดสอบ Log_แผนผลิต (8 คอลัมน์)
  const logData = {
    sheetName: "Log_แผนผลิต",
    rows: [
      ["วันอังคารที่ 29 กรกฎาคม 2568", "29/07/2025", "TEST001", "งานทดสอบ", "ผู้ทดสอบ", "09:00", "10:00", "ห้องทดสอบ"]
    ],
    clearSheet: true
  };
  
  // ทดสอบ 1.ใบสรุปงาน v.4 (11 คอลัมน์)
  const summaryData = {
    sheetName: "1.ใบสรุปงาน v.4",
    rows: [
      [1, "TEST001", "งานทดสอบ", "ผู้ทดสอบ", "", "", "", "09:00", "10:00", "เครื่องทดสอบ", "ห้องทดสอบ", "หมายเหตุทดสอบ"]
    ],
    clearSheet: true
  };
  
  // ทดสอบ รายงาน-เวลาผู้ปฏิบัติงาน
  const reportData = {
    sheetName: "รายงาน-เวลาผู้ปฏิบัติงาน",
    "Date Value": "29/07/2025"
  };
  
  try {
    console.log('🟡 [TEST] ทดสอบ Log_แผนผลิต (8 คอลัมน์):');
    console.log('🟡 [TEST] ข้อมูล:', logData);
    
    const logResponse = await fetch('http://localhost:3101/api/send-to-google-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
    
    console.log('🟡 [TEST] Log response status:', logResponse.status);
    const logResult = await logResponse.text();
    console.log('🟢 [TEST] Log response:', logResult);
    
    console.log('\n🟡 [TEST] ทดสอบ 1.ใบสรุปงาน v.4 (11 คอลัมน์):');
    console.log('🟡 [TEST] ข้อมูล:', summaryData);
    
    const summaryResponse = await fetch('http://localhost:3101/api/send-to-google-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(summaryData),
    });
    
    console.log('🟡 [TEST] Summary response status:', summaryResponse.status);
    const summaryResult = await summaryResponse.text();
    console.log('🟢 [TEST] Summary response:', summaryResult);
    
    console.log('\n🟡 [TEST] ทดสอบ รายงาน-เวลาผู้ปฏิบัติงาน:');
    console.log('🟡 [TEST] ข้อมูล:', reportData);
    
    const reportResponse = await fetch('http://localhost:3101/api/send-to-google-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });
    
    console.log('🟡 [TEST] Report response status:', reportResponse.status);
    const reportResult = await reportResponse.text();
    console.log('🟢 [TEST] Report response:', reportResult);
    
    console.log('\n✅ [TEST] การทดสอบเสร็จสิ้น!');
    
  } catch (error) {
    console.error('🔴 [TEST] Error:', error.message);
  }
}

testFixedData(); 