const express = require('express');
const router = express.Router();
const {
  getAllProductionStatuses,
  getProductionStatusById,
  createProductionStatus,
  updateProductionStatus,
  deleteProductionStatus,
  updateWorkPlanStatus,
  getActiveProductionStatuses
} = require('../controllers/productionStatusController');

// Production Status Routes
router.get('/', getAllProductionStatuses);
router.get('/active', getActiveProductionStatuses);
router.get('/:id', getProductionStatusById);
router.post('/', createProductionStatus);
router.put('/:id', updateProductionStatus);
router.delete('/:id', deleteProductionStatus);

// Work Plan Status Update Route
router.patch('/work-plans/:id/status', updateWorkPlanStatus);

module.exports = router; 