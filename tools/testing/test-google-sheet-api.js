// Test script for Google Sheet API
// Use built-in fetch for Node.js 18+

async function testGoogleSheetAPI() {
  console.log('🧪 Testing Google Sheet API...');
  
  const testData = {
    sheetName: "test-sheet",
    rows: [
      ["Test Row 1", "Data 1", "Data 2"],
      ["Test Row 2", "Data 3", "Data 4"]
    ]
  };

  try {
    // Test 1: Direct Google Apps Script URL
    console.log('\n📡 Test 1: Direct Google Apps Script URL');
    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbxJ0u_K-ggpyOL2og9ZM8ungJrAwMWUhibsPOCzqy5Kjf_ybBXG8AplIUIvL0V9VNRO/exec';
    
    const response1 = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    console.log('Status:', response1.status);
    console.log('Status Text:', response1.statusText);
    
    const result1 = await response1.text();
    console.log('Response:', result1);
    
    // Test 2: Backend proxy endpoint (if server is running)
    console.log('\n📡 Test 2: Backend proxy endpoint');
    try {
      const response2 = await fetch('http://localhost:3101/api/send-to-google-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      
      console.log('Status:', response2.status);
      console.log('Status Text:', response2.statusText);
      
      const result2 = await response2.text();
      console.log('Response:', result2);
    } catch (error) {
      console.log('❌ Backend server not running:', error.message);
    }
    
    // Test 3: Frontend API route (if Next.js is running)
    console.log('\n📡 Test 3: Frontend API route');
    try {
      const response3 = await fetch('http://localhost:3011/api/send-to-google-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      });
      
      console.log('Status:', response3.status);
      console.log('Status Text:', response3.statusText);
      
      const result3 = await response3.text();
      console.log('Response:', result3);
    } catch (error) {
      console.log('❌ Frontend server not running:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testGoogleSheetAPI();
