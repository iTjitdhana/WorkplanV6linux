const fetch = require('node-fetch').default;

async function testDifferentDates() {
  const testDates = [
    { selectedDate: "2025-07-25", expectedDateValue: "25/07/2025" },
    { selectedDate: "2025-07-26", expectedDateValue: "26/07/2025" },
    { selectedDate: "2025-07-27", expectedDateValue: "27/07/2025" }
  ];

  for (const testCase of testDates) {
    console.log(`\n🟡 [TEST] Testing date: ${testCase.selectedDate}`);
    
    // สร้าง dateValue เหมือนใน frontend
    const selectedDateObj = new Date(testCase.selectedDate);
    const dateString = selectedDateObj.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric' 
    });
    const dateValue = selectedDateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
    
    console.log("🟡 [TEST] Generated dateValue:", dateValue);
    console.log("🟡 [TEST] Expected dateValue:", testCase.expectedDateValue);
    console.log("🟡 [TEST] dateString:", dateString);
    
    const testData = {
      sheetName: "รายงาน-เวลาผู้ปฏิบัติงาน",
      "Date Value": dateValue,
      "วันที่": dateString
    };

    console.log("🟡 [TEST] Sending data:", testData);

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
    
    // รอ 1 วินาทีระหว่างการทดสอบ
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testDifferentDates(); 