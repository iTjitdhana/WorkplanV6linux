const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '192.168.0.94',
  user: process.env.DB_USER || 'jitdhana',
  password: process.env.DB_PASSWORD || 'iT123454$',
  database: process.env.DB_NAME || 'esp_tracker',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

module.exports = {
  pool,
  testConnection
}; 