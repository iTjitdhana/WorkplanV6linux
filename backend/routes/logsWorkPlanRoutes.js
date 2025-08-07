const express = require('express');
const router = express.Router();
const logsWorkPlanController = require('../controllers/logsWorkPlanController');

// Get all logs with filtering
router.get('/', logsWorkPlanController.getLogs);

// Get logs by specific date
router.get('/date/:date', logsWorkPlanController.getLogsByDate);

// Get work plans by date
router.get('/workplans/:date', logsWorkPlanController.getWorkPlansByDate);

// Get previous material data for auto-fill
router.get('/previous-material/:job_code', logsWorkPlanController.getPreviousMaterialData);

// Create new log
router.post('/', logsWorkPlanController.createLog);

// Update log
router.put('/:id', logsWorkPlanController.updateLog);

// Delete log
router.delete('/:id', logsWorkPlanController.deleteLog);

// Bulk create logs
router.post('/bulk', logsWorkPlanController.bulkCreateLogs);

module.exports = router;
