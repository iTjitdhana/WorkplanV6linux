const express = require('express');
const router = express.Router();
const ProductionLogController = require('../controllers/productionLogController');

// ดึงข้อมูลจากวันล่าสุดที่มีข้อมูล
router.get('/latest', ProductionLogController.getLatestProductionData);

// ดึงข้อมูลทั้งหมด
router.get('/', ProductionLogController.getAll);

// ดึงข้อมูลตาม ID
router.get('/:id', ProductionLogController.getById);

// สร้างข้อมูลใหม่
router.post('/', ProductionLogController.create);

// อัปเดตข้อมูล
router.put('/:id', ProductionLogController.update);

// ลบข้อมูล
router.delete('/:id', ProductionLogController.delete);

// สถิติสรุป
router.get('/stats/summary', ProductionLogController.getSummaryStats);

// วิเคราะห์ Yield %
router.get('/stats/yield-analysis', ProductionLogController.getYieldAnalysis);

// ข้อมูล Dashboard
router.get('/dashboard/data', ProductionLogController.getDashboardData);

module.exports = router;
