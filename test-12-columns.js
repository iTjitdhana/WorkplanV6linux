const fetch = require('node-fetch').default;

async function test12Columns() {
  console.log('🧪 [TEST] ทดสอบข้อมูล 12 คอลัมน์...');
  
  // ทดสอบ 1.ใบสรุปงาน v.4 (12 คอลัมน์ A-L)
  const summaryData = {
    sheetName: "1.ใบสรุปงาน v.4",
    rows: [
      [
        1, // ลำดับ (A)
        "TEST001", // รหัสวัตถุดิบ (B)
        "งานทดสอบ", // รายการ (C)
        "ผู้ทดสอบ1", // ผู้ปฏิบัติงาน 1 (D)
        "ผู้ทดสอบ2", // ผู้ปฏิบัติงาน 2 (E)
        "", // ผู้ปฏิบัติงาน 3 (F)
        "", // ผู้ปฏิบัติงาน 4 (G)
        "09:00", // เริ่มต้น (H)
        "10:00", // สิ้นสุด (I)
        "เครื่องทดสอบ", // เครื่องที่ (J)
        "ห้องทดสอบ", // ห้องผลิต (K)
        "" // ผลิตเสร็จ (L) - ว่างไว้
      ]
    ],
    clearSheet: true
  };
  
  try {
    console.log('🟡 [TEST] ทดสอบ 1.ใบสรุปงาน v.4 (12 คอลัมน์):');
    console.log('🟡 [TEST] ข้อมูล:', summaryData);
    console.log('🟡 [TEST] จำนวนคอลัมน์:', summaryData.rows[0].length);
    
    const response = await fetch('http://localhost:3101/api/send-to-google-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(summaryData),
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

test12Columns(); 