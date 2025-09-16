const express = require('express');
const { body } = require('express-validator');
const LogController = require('../controllers/logController');

const router = express.Router();

// Validation middleware - ไม่ต้อง validate work_plan_id เพื่อให้งานตวงสูตรทำงานได้
const logValidation = [
  body('process_number')
    .isInt({ min: 1 })
    .withMessage('Process number must be a positive integer'),
  body('status')
    .isIn(['start', 'stop'])
    .withMessage('Status must be either "start" or "stop"'),
  body('timestamp')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Timestamp must be a valid date')
];

// Routes
router.get('/', LogController.getAll);
router.get('/daily-summary', LogController.getDailySummary);
router.get('/work-plan/:workPlanId', LogController.getByWorkPlanId);
router.get('/work-plan/:workPlanId/status', LogController.getProcessStatus);
router.get('/work-plans/status', LogController.getWorkPlansStatus);
router.get('/summary/:date', LogController.getProductionSummary);
router.get('/:id', LogController.getById);

router.post('/', LogController.create);
router.post('/start', LogController.startProcess);
router.post('/stop', LogController.stopProcess);

router.put('/:id', logValidation, LogController.update);
router.delete('/:id', LogController.delete);

module.exports = router; 