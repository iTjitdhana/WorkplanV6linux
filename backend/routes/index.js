const express = require('express');
const workPlanRoutes = require('./workPlanRoutes');
const logRoutes = require('./logRoutes');
const logsWorkPlanRoutes = require('./logsWorkPlanRoutes');
const processStepRoutes = require('./processStepRoutes');
const userRoutes = require('./userRoutes');
const machineRoutes = require('./machineRoutes');
const productionRoomRoutes = require('./productionRoomRoutes');
const productionStatusRoutes = require('./productionStatusRoutes');
const newJobsRoutes = require('./newJobsRoutes');
const googleSheetProxy = require('./googleSheetProxy');
const productionLogRoutes = require('./productionLogRoutes');

const router = express.Router();

// API Routes
router.use('/work-plans', workPlanRoutes);
router.use('/logs', logRoutes);
router.use('/logs-workplans', logsWorkPlanRoutes);
router.use('/process-steps', processStepRoutes);
router.use('/users', userRoutes);
router.use('/machines', machineRoutes);
router.use('/production-rooms', productionRoomRoutes);
router.use('/production-statuses', productionStatusRoutes);
router.use('/new-jobs', newJobsRoutes);
router.use('/send-to-google-sheet', googleSheetProxy);
router.use('/production-logs', productionLogRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ESP Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 