// Test Google Apps Script directly
const https = require('https');

async function testGoogleScript() {
  console.log('🧪 Testing Google Apps Script directly...');
  
  const testData = {
    sheetName: "test-sheet",
    rows: [
      ["Test Row 1", "Data 1", "Data 2"],
      ["Test Row 2", "Data 3", "Data 4"]
    ]
  };

  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'script.google.com',
    port: 443,
    path: '/macros/s/AKfycbxJ0u_K-ggpyOL2og9ZM8ungJrAwMWUhibsPOCzqy5Kjf_ybBXG8AplIUIvL0V9VNRO/exec',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response:', data);
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (err) => {
      console.error('Error:', err);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Run test
testGoogleScript()
  .then(result => {
    console.log('✅ Test completed successfully');
    console.log('Result:', result);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });
