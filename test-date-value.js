const fetch = require('node-fetch').default;

async function testDateValue() {
  const testData = {
    sheetName: "รายงาน-เวลาผู้ปฏิบัติงาน",
    "Date Value": "25/07/2025",
    "วันที่": "วันพฤหัสบดีที่ 25/7/68"
  };

  console.log("🟡 [TEST] ส่งข้อมูลทดสอบ:", testData);

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbxJ0u_K-ggpyOL2og9ZM8ungJrAwMWUhibsPOCzqy5Kjf_ybBXG8AplIUIvL0V9VNRO/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    console.log("🟡 [TEST] Response status:", response.status);
    const result = await response.text();
    console.log("🟢 [TEST] Response:", result);
    
    if (!response.ok) {
      console.error("🔴 [TEST] Error status:", response.status);
    }
  } catch (err) {
    console.error("🔴 [TEST] Error:", err);
  }
}

testDateValue(); 