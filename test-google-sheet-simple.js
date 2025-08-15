// Simple test for Google Sheet API
async function testGoogleSheet() {
  console.log('🧪 Testing Google Sheet API...');
  
  const testData = {
    sheetName: "test-sheet",
    rows: [
      ["Test Row 1", "Data 1", "Data 2"],
      ["Test Row 2", "Data 3", "Data 4"]
    ]
  };

  try {
    console.log('📡 Testing frontend API route...');
    const response = await fetch('http://localhost:3012/api/send-to-google-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const result = await response.text();
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Google Sheet API is working!');
    } else {
      console.log('❌ Google Sheet API failed');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Run the test
testGoogleSheet();
