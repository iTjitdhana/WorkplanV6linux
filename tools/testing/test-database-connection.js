const mysql = require('mysql2/promise');

// ทดสอบการเชื่อมต่อฐานข้อมูล
async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

  const configs = [
    {
      name: '192.168.0.94 (Production)',
      host: '192.168.0.94',
      user: 'jitdhana',
      password: 'iT12345$',
      database: 'esp_tracker',
      port: 3306
    },
    {
      name: 'localhost (Local)',
      host: 'localhost',
      user: 'jitdhana',
      password: 'iT12345$',
      database: 'esp_tracker',
      port: 3306
    },
    {
      name: 'host.docker.internal (Docker)',
      host: 'host.docker.internal',
      user: 'jitdhana',
      password: 'iT12345$',
      database: 'esp_tracker',
      port: 3306
    }
  ];

  for (const config of configs) {
    console.log(`📡 Testing: ${config.name}`);
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Database: ${config.database}`);
    
    try {
      const connection = await mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        port: config.port,
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000
      });

      // ทดสอบ query
      const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time');
      console.log('   ✅ Connection SUCCESS');
      console.log(`   🕐 Server time: ${rows[0].current_time}`);
      
      // ทดสอบ query ข้อมูลจริง
      try {
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`   📊 Tables found: ${tables.length}`);
        if (tables.length > 0) {
          console.log('   📋 Table names:', tables.map(t => Object.values(t)[0]).join(', '));
        }
      } catch (tableError) {
        console.log('   ⚠️  Could not fetch tables:', tableError.message);
      }

      await connection.end();
      console.log('   🔌 Connection closed\n');
      
    } catch (error) {
      console.log('   ❌ Connection FAILED');
      console.log(`   🔍 Error: ${error.message}`);
      console.log(`   📝 Code: ${error.code}`);
      console.log(`   🔢 Errno: ${error.errno}\n`);
    }
  }
}

// ทดสอบ ping
async function testPing() {
  console.log('🏓 Testing Network Connectivity...\n');
  
  const hosts = ['192.168.0.94', 'localhost', 'host.docker.internal'];
  
  for (const host of hosts) {
    console.log(`📡 Pinging ${host}...`);
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const { stdout, stderr } = await execAsync(`ping -n 1 ${host}`);
      if (stderr) {
        console.log(`   ❌ Ping failed: ${stderr}`);
      } else {
        console.log(`   ✅ Ping successful`);
        const timeMatch = stdout.match(/time[=<](\d+)ms/);
        if (timeMatch) {
          console.log(`   ⏱️  Response time: ${timeMatch[1]}ms`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Ping error: ${error.message}`);
    }
    console.log('');
  }
}

// ทดสอบ port
async function testPort() {
  console.log('🔌 Testing Port Connectivity...\n');
  
  const tests = [
    { host: '192.168.0.94', port: 3306, name: 'MySQL on 192.168.0.94' },
    { host: 'localhost', port: 3306, name: 'MySQL on localhost' },
    { host: 'host.docker.internal', port: 3306, name: 'MySQL on host.docker.internal' }
  ];
  
  for (const test of tests) {
    console.log(`📡 Testing ${test.name} (${test.host}:${test.port})...`);
    try {
      const net = require('net');
      const socket = new net.Socket();
      
      const result = await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          socket.destroy();
          resolve({ success: false, error: 'Connection timeout' });
        }, 5000);
        
        socket.connect(test.port, test.host, () => {
          clearTimeout(timeout);
          socket.destroy();
          resolve({ success: true });
        });
        
        socket.on('error', (error) => {
          clearTimeout(timeout);
          resolve({ success: false, error: error.message });
        });
      });
      
      if (result.success) {
        console.log('   ✅ Port is open');
      } else {
        console.log(`   ❌ Port is closed: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Test failed: ${error.message}`);
    }
    console.log('');
  }
}

// รันการทดสอบทั้งหมด
async function runAllTests() {
  console.log('🚀 Starting Database Connection Tests\n');
  console.log('=' .repeat(60));
  
  await testPing();
  console.log('=' .repeat(60));
  
  await testPort();
  console.log('=' .repeat(60));
  
  await testDatabaseConnection();
  console.log('=' .repeat(60));
  
  console.log('✅ All tests completed!');
}

// รันการทดสอบ
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testDatabaseConnection,
  testPing,
  testPort,
  runAllTests
};
