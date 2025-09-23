// ทดสอบการส่งข้อมูลงานตวงสูตรไปยัง backend
async function testWeighingJob() {
  console.log('🧪 ทดสอบงานตวงสูตร...');
  
  const testData = {
    process_number: 1,
    status: 'start',
    timestamp: new Date().toISOString()
  };

  try {
    console.log('📡 ส่งข้อมูลไปยัง backend...');
    console.log('📋 ข้อมูลที่ส่ง:', testData);
    
    const response = await fetch('http://192.168.0.94:3102/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    const result = await response.text();
    console.log('📄 Response:', result);
    
    if (response.ok) {
      console.log('✅ งานตวงสูตรทำงานได้!');
    } else {
      console.log('❌ งานตวงสูตรมีปัญหา');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// ทดสอบผ่าน frontend API
async function testFrontendWeighingJob() {
  console.log('🧪 ทดสอบผ่าน frontend API...');
  
  const testData = {
    process_number: 1,
    status: 'start',
    timestamp: new Date().toISOString()
  };

  try {
    console.log('📡 ส่งข้อมูลไปยัง frontend API...');
    console.log('📋 ข้อมูลที่ส่ง:', testData);
    
    const response = await fetch('http://localhost:3012/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    const result = await response.text();
    console.log('📄 Response:', result);
    
    if (response.ok) {
      console.log('✅ Frontend API ทำงานได้!');
    } else {
      console.log('❌ Frontend API มีปัญหา');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// รันการทดสอบ
console.log('🚀 เริ่มการทดสอบ...');
testWeighingJob().then(() => {
  console.log('\n---\n');
  return testFrontendWeighingJob();
}).then(() => {
  console.log('\n✅ การทดสอบเสร็จสิ้น');
});
