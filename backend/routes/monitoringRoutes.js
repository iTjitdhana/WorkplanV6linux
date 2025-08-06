const express = require('express');
const router = express.Router();
const systemMonitor = require('../monitoring');

// GET /api/monitoring/stats - รับสถิติระบบ
router.get('/stats', (req, res) => {
  try {
    const stats = systemMonitor.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting monitoring stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting monitoring stats'
    });
  }
});

// GET /api/monitoring/alerts - รับการแจ้งเตือน
router.get('/alerts', (req, res) => {
  try {
    const alerts = systemMonitor.getAlerts();
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error getting monitoring alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting monitoring alerts'
    });
  }
});

// POST /api/monitoring/start - เริ่มการติดตาม
router.post('/start', (req, res) => {
  try {
    systemMonitor.start();
    res.json({
      success: true,
      message: 'Monitoring started successfully'
    });
  } catch (error) {
    console.error('Error starting monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting monitoring'
    });
  }
});

// POST /api/monitoring/stop - หยุดการติดตาม
router.post('/stop', (req, res) => {
  try {
    systemMonitor.stop();
    res.json({
      success: true,
      message: 'Monitoring stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Error stopping monitoring'
    });
  }
});

// DELETE /api/monitoring/alerts - ล้างการแจ้งเตือน
router.delete('/alerts', (req, res) => {
  try {
    systemMonitor.clearAlerts();
    res.json({
      success: true,
      message: 'Alerts cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing alerts'
    });
  }
});

// POST /api/monitoring/health - ตรวจสอบสุขภาพระบบ
router.post('/health', async (req, res) => {
  try {
    await systemMonitor.checkSystemHealth();
    await systemMonitor.checkDatabaseHealth();
    
    const stats = systemMonitor.getStats();
    res.json({
      success: true,
      data: {
        systemHealth: stats.systemHealth,
        uptime: stats.uptime,
        requests: stats.requests,
        errors: stats.errors,
        errorRate: stats.requests > 0 ? (stats.errors / stats.requests * 100) : 0,
        databaseConnections: stats.databaseConnections,
        activeUsers: stats.activeUsers
      }
    });
  } catch (error) {
    console.error('Error in health check:', error);
    res.status(500).json({
      success: false,
      message: 'Error in health check'
    });
  }
});

module.exports = router; 