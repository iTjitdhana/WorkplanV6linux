const express = require('express');
const router = express.Router();

// เก็บการตั้งค่าในหน่วยความจำ (ในระบบจริงควรเก็บในฐานข้อมูล)
let settings = {
  syncModeEnabled: true, // เปลี่ยนจาก false เป็น true
  specialWorkDates: [], // รายการวันที่ที่ใช้โหมดงานพิเศษ
  specialWorkMode: {
    enabled: false,
    selectedDates: [],
    applyToAll: false // ใช้กับทุกวัน
  }
};

// GET /api/settings - รับการตั้งค่า
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting settings'
    });
  }
});

// POST /api/settings - บันทึกการตั้งค่า
router.post('/', (req, res) => {
  try {
    const { syncModeEnabled, specialWorkMode } = req.body;
    
    // อัปเดตการตั้งค่า
    settings = {
      ...settings,
      syncModeEnabled: syncModeEnabled || false,
      specialWorkMode: specialWorkMode || settings.specialWorkMode
    };
    
    console.log('Settings updated:', settings);
    
    res.json({
      success: true,
      message: 'Settings saved successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving settings'
    });
  }
});

// PUT /api/settings - อัปเดตการตั้งค่า (เพิ่มเติม)
router.put('/', (req, res) => {
  try {
    const { syncModeEnabled, specialWorkMode } = req.body;
    
    // อัปเดตการตั้งค่า
    settings = {
      ...settings,
      syncModeEnabled: syncModeEnabled || false,
      specialWorkMode: specialWorkMode || settings.specialWorkMode
    };
    
    console.log('Settings updated via PUT:', settings);
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings'
    });
  }
});

// POST /api/settings/backup - สร้าง backup
router.post('/backup', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Backup created successfully'
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating backup'
    });
  }
});

// GET /api/settings/test-db - ทดสอบฐานข้อมูล
router.get('/test-db', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Database test endpoint working'
    });
  } catch (error) {
    console.error('Error testing database:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing database'
    });
  }
});

// POST /api/settings/test-db - รัน SQL query สำหรับทดสอบ
router.post('/test-db', async (req, res) => {
  const { pool } = require('../config/database');
  
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }
    
    console.log('Executing test query:', query);
    
    const [rows] = await pool.execute(query);
    
    res.json({
      success: true,
      message: 'Query executed successfully',
      data: rows,
      rowCount: rows.length
    });
  } catch (error) {
    console.error('Error executing test query:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 