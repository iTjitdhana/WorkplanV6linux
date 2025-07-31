// ทดสอบการสร้าง dateValue จาก selectedDate ที่แตกต่างกัน

function testDateValue(selectedDate) {
  console.log(`\n🟡 [TEST] Testing selectedDate: ${selectedDate}`);
  
  const selectedDateObj = new Date(selectedDate);
  const dateString = selectedDateObj.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric' 
  });
  const dateValue = selectedDateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
  
  console.log("🟡 [TEST] selectedDateObj:", selectedDateObj);
  console.log("🟡 [TEST] dateString:", dateString);
  console.log("🟡 [TEST] dateValue:", dateValue);
  
  return { dateString, dateValue };
}

// ทดสอบวันที่ต่างๆ
const testDates = [
  "2025-07-25", // วันที่เลือกในหน้ารายวัน
  "2025-07-26", // วันที่อื่น
  "2025-07-27", // วันที่อื่น
  new Date().toISOString().slice(0, 10) // วันที่ปัจจุบัน
];

testDates.forEach(date => {
  testDateValue(date);
}); 