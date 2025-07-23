const express = require('express');
const router = express.Router();
const {
  getAllMachines,
  getMachineById,
  getMachinesByStatus,
  createMachine,
  updateMachine,
  deleteMachine
} = require('../controllers/machineController');

// GET /api/machines - ดึงรายการเครื่องทั้งหมด
router.get('/', getAllMachines);

// GET /api/machines/status/:status - ดึงรายการเครื่องตามสถานะ
router.get('/status/:status', getMachinesByStatus);

// GET /api/machines/:id - ดึงข้อมูลเครื่องตาม ID
router.get('/:id', getMachineById);

// POST /api/machines - เพิ่มเครื่องใหม่
router.post('/', createMachine);

// PUT /api/machines/:id - แก้ไขข้อมูลเครื่อง
router.put('/:id', updateMachine);

// DELETE /api/machines/:id - ลบเครื่อง
router.delete('/:id', deleteMachine);

module.exports = router; 