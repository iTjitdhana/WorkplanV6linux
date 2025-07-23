const mysql = require('mysql2/promise');
require('dotenv').config();

// ตรวจสอบ environment
const isDevelopment = process.env.NODE_ENV !== 'production';
const isLocalhost = process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';

// Configuration สำหรับ environments ต่างๆ
const dbConfig = {
  // ถ้าเป็น production และไม่ได้ระบุ host ให้ใช้ localhost
  host: process.env.DB_HOST || (isDevelopment ? '192.168.0.94' : 'localhost'),
  user: process.env.DB_USER || (isDevelopment ? 'jitdhana' : 'root'),
  password: process.env.DB_PASSWORD || (isDevelopment ? 'iT123454$' : ''),
  database: process.env.DB_NAME || 'esp_tracker',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  // ลบ invalid options ที่ทำให้เกิด warnings
  // acquireTimeout: 60000,  // ไม่ support ใน mysql2
  // timeout: 60000,         // ไม่ support ใน mysql2  
  // reconnect: true,        // ไม่ support ใน mysql2
  // ใช้ options ที่ถูกต้องแทน
  idleTimeout: 60000,
  queueLimit: 0,
  // เพิ่ม options สำหรับแก้ปัญหา connection
  ssl: false,
  // ใช้ authPlugins API ใหม่แทน authSwitchHandler ที่ deprecated
  authPlugins: {
    mysql_native_password: () => {
      console.log('🔄 Using mysql_native_password authentication');
      return Buffer.from(dbConfig.password + '\0');
    }
  }
};

console.log('🔧 Database Configuration:');
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Host:', dbConfig.host);
console.log('   User:', dbConfig.user);
console.log('   Database:', dbConfig.database);
console.log('   Port:', dbConfig.port);
console.log('   Is Development:', isDevelopment);
console.log('   Is Localhost:', isLocalhost);

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    console.log('🏠 Connected to host:', connection.config.host);
    console.log('👤 Connected as user:', connection.config.user);
    
    // ทดสอบ query พื้นฐาน
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('🧪 Database query test:', rows[0].test === 1 ? 'PASSED' : 'FAILED');
    
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔍 Error details:');
    console.error('   Code:', error.code);
    console.error('   Errno:', error.errno);
    console.error('   SQL State:', error.sqlState);
    
    // แสดงคำแนะนำการแก้ไขตาม environment
    console.log('\n💡 Possible solutions:');
    
    if (isDevelopment) {
      console.log('🔧 DEVELOPMENT MODE SOLUTIONS:');
      console.log('1. Check if MySQL server is running on', dbConfig.host + ':' + dbConfig.port);
      console.log('2. Verify username and password:', dbConfig.user, '/ [password hidden]');
      console.log('3. Check if user has permission to connect from this host');
      console.log('4. Run this MySQL command as root:');
      console.log(`   GRANT ALL PRIVILEGES ON ${dbConfig.database}.* TO "${dbConfig.user}"@"%" IDENTIFIED BY "${dbConfig.password}";`);
      console.log('   FLUSH PRIVILEGES;');
      console.log('5. Check if MySQL allows remote connections:');
      console.log('   Edit /etc/mysql/mysql.conf.d/mysqld.cnf');
      console.log('   Set: bind-address = 0.0.0.0');
      console.log('   Then: sudo systemctl restart mysql');
    } else {
      console.log('🚀 PRODUCTION MODE SOLUTIONS:');
      console.log('1. Check if MySQL server is running locally on the server');
      console.log('2. Verify MySQL is installed: sudo systemctl status mysql');
      console.log('3. Start MySQL if not running: sudo systemctl start mysql');
      console.log('4. Check if database exists: mysql -u root -p -e "SHOW DATABASES;"');
      console.log('5. Import database if needed: mysql -u root -p esp_tracker < esp_tracker.sql');
      console.log('6. Create user if needed:');
      console.log('   mysql -u root -p -e "CREATE USER IF NOT EXISTS \'root\'@\'localhost\' IDENTIFIED BY \'your_password\';"');
      console.log('   mysql -u root -p -e "GRANT ALL PRIVILEGES ON esp_tracker.* TO \'root\'@\'localhost\';"');
      console.log('   mysql -u root -p -e "FLUSH PRIVILEGES;"');
    }
    
    console.log('\n🔄 You can also try these environment variables:');
    console.log('   DB_HOST=localhost');
    console.log('   DB_USER=root');
    console.log('   DB_PASSWORD=your_mysql_root_password');
    console.log('   DB_NAME=esp_tracker');
    console.log('   NODE_ENV=production');
    
    console.log('\n🔧 Quick test commands:');
    console.log(`   mysql -h ${dbConfig.host} -u ${dbConfig.user} -p ${dbConfig.database}`);
    console.log(`   telnet ${dbConfig.host} ${dbConfig.port}`);
  }
};

module.exports = {
  pool,
  testConnection
}; 