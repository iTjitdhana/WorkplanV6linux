const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '192.168.0.94',
  user: process.env.DB_USER || 'jitdhana',
  password: process.env.DB_PASSWORD || 'iT123454$',
  database: process.env.DB_NAME || 'esp_tracker',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // เพิ่ม options สำหรับแก้ปัญหา connection
  ssl: false,
  authSwitchHandler: function (data, cb) {
    if (data.pluginName === 'mysql_native_password') {
      console.log('🔄 Using mysql_native_password authentication');
      cb(null, Buffer.from(dbConfig.password + '\0'));
    }
  }
};

console.log('🔧 Database Configuration:');
console.log('   Host:', dbConfig.host);
console.log('   User:', dbConfig.user);
console.log('   Database:', dbConfig.database);
console.log('   Port:', dbConfig.port);

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    console.log('🏠 Connected to host:', connection.config.host);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔍 Error details:');
    console.error('   Code:', error.code);
    console.error('   Errno:', error.errno);
    console.error('   SQL State:', error.sqlState);
    
    // แสดงคำแนะนำการแก้ไข
    console.log('\n💡 Possible solutions:');
    console.log('1. Check if MySQL server is running on 192.168.0.94:3306');
    console.log('2. Verify username and password: jitdhana / iT123454$');
    console.log('3. Check if user "jitdhana" has permission to connect from this host');
    console.log('4. Run this MySQL command as root:');
    console.log('   GRANT ALL PRIVILEGES ON esp_tracker.* TO "jitdhana"@"%" IDENTIFIED BY "iT123454$";');
    console.log('   FLUSH PRIVILEGES;');
  }
};

module.exports = {
  pool,
  testConnection
}; 