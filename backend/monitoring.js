const { pool } = require('./config/database');
const moment = require('moment');

class SystemMonitor {
  constructor() {
    this.stats = {
      startTime: new Date(),
      requests: 0,
      errors: 0,
      databaseConnections: 0,
      activeUsers: 0,
      systemHealth: 'healthy'
    };
    
    this.alerts = [];
    this.isMonitoring = false;
  }

  // เริ่มการติดตาม
  start() {
    if (this.isMonitoring) return;
    
    console.log('🔍 Starting real-time monitoring system...');
    this.isMonitoring = true;
    
    // ตรวจสอบทุก 30 วินาที
    this.monitoringInterval = setInterval(() => {
      this.checkSystemHealth();
    }, 30000);
    
    // ตรวจสอบ database connection ทุก 1 นาที
    this.dbMonitoringInterval = setInterval(() => {
      this.checkDatabaseHealth();
    }, 60000);
    
    console.log('✅ Real-time monitoring started');
  }

  // หยุดการติดตาม
  stop() {
    if (!this.isMonitoring) return;
    
    console.log('🛑 Stopping real-time monitoring system...');
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.dbMonitoringInterval) {
      clearInterval(this.dbMonitoringInterval);
    }
    
    console.log('✅ Real-time monitoring stopped');
  }

  // ตรวจสอบสุขภาพระบบ
  async checkSystemHealth() {
    try {
      const uptime = moment().diff(this.stats.startTime, 'minutes');
      const errorRate = this.stats.requests > 0 ? (this.stats.errors / this.stats.requests * 100) : 0;
      
      // ตรวจสอบ error rate
      if (errorRate > 10) {
        this.createAlert('HIGH_ERROR_RATE', `Error rate is ${errorRate.toFixed(2)}%`);
        this.stats.systemHealth = 'warning';
      } else if (errorRate > 5) {
        this.createAlert('MEDIUM_ERROR_RATE', `Error rate is ${errorRate.toFixed(2)}%`);
        this.stats.systemHealth = 'warning';
      } else {
        this.stats.systemHealth = 'healthy';
      }
      
      // ตรวจสอบ uptime
      if (uptime > 1440) { // 24 ชั่วโมง
        this.createAlert('LONG_UPTIME', `System has been running for ${uptime} minutes`);
      }
      
      console.log('📊 System Health Check:', {
        uptime: `${uptime} minutes`,
        requests: this.stats.requests,
        errors: this.stats.errors,
        errorRate: `${errorRate.toFixed(2)}%`,
        health: this.stats.systemHealth,
        activeUsers: this.stats.activeUsers
      });
      
    } catch (error) {
      console.error('❌ Error in system health check:', error);
      this.createAlert('MONITORING_ERROR', error.message);
    }
  }

  // ตรวจสอบสุขภาพ database
  async checkDatabaseHealth() {
    try {
      const connection = await pool.getConnection();
      
      // ตรวจสอบ connection pool
      const poolStats = pool.pool;
      this.stats.databaseConnections = poolStats.length;
      
      // ทดสอบ query
      const [rows] = await connection.execute('SELECT 1 as test');
      
      if (rows[0].test !== 1) {
        this.createAlert('DATABASE_ERROR', 'Database query test failed');
      }
      
      // ตรวจสอบจำนวน connections
      if (this.stats.databaseConnections > 8) {
        this.createAlert('HIGH_DB_CONNECTIONS', `Database has ${this.stats.databaseConnections} active connections`);
      }
      
      connection.release();
      
      console.log('🗄️ Database Health Check:', {
        connections: this.stats.databaseConnections,
        status: 'healthy'
      });
      
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      this.createAlert('DATABASE_CONNECTION_ERROR', error.message);
    }
  }

  // สร้างการแจ้งเตือน
  createAlert(type, message) {
    const alert = {
      id: Date.now(),
      type: type,
      message: message,
      timestamp: new Date(),
      severity: this.getSeverity(type)
    };
    
    this.alerts.push(alert);
    
    // แสดงการแจ้งเตือนใน console
    console.log(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    // เก็บแค่ 100 การแจ้งเตือนล่าสุด
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  // กำหนดความรุนแรงของการแจ้งเตือน
  getSeverity(type) {
    const highSeverity = ['DATABASE_ERROR', 'MONITORING_ERROR', 'HIGH_ERROR_RATE'];
    const mediumSeverity = ['HIGH_DB_CONNECTIONS', 'MEDIUM_ERROR_RATE'];
    
    if (highSeverity.includes(type)) return 'high';
    if (mediumSeverity.includes(type)) return 'medium';
    return 'low';
  }

  // เพิ่มสถิติ request
  incrementRequests() {
    this.stats.requests++;
  }

  // เพิ่มสถิติ error
  incrementErrors() {
    this.stats.errors++;
  }

  // อัปเดตจำนวนผู้ใช้ที่ใช้งาน
  updateActiveUsers(count) {
    this.stats.activeUsers = count;
  }

  // รับสถิติปัจจุบัน
  getStats() {
    return {
      ...this.stats,
      uptime: moment().diff(this.stats.startTime, 'minutes'),
      alerts: this.alerts.slice(-10) // 10 การแจ้งเตือนล่าสุด
    };
  }

  // รับการแจ้งเตือนทั้งหมด
  getAlerts() {
    return this.alerts;
  }

  // ล้างการแจ้งเตือน
  clearAlerts() {
    this.alerts = [];
    console.log('🧹 Alerts cleared');
  }
}

// สร้าง instance เดียว
const systemMonitor = new SystemMonitor();

module.exports = systemMonitor; 