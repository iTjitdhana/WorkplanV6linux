const express = require('express');
const router = express.Router();
const {
  getAllProductionRooms,
  getProductionRoomById,
  getProductionRoomsByType,
  getProductionRoomsByStatus,
  createProductionRoom,
  updateProductionRoom,
  deleteProductionRoom
} = require('../controllers/productionRoomController');

// GET /api/production-rooms - ดึงรายการห้องผลิตทั้งหมด
router.get('/', getAllProductionRooms);

// GET /api/production-rooms/type/:type - ดึงรายการห้องผลิตตามประเภท
router.get('/type/:type', getProductionRoomsByType);

// GET /api/production-rooms/status/:status - ดึงรายการห้องผลิตตามสถานะ
router.get('/status/:status', getProductionRoomsByStatus);

// GET /api/production-rooms/:id - ดึงข้อมูลห้องผลิตตาม ID
router.get('/:id', getProductionRoomById);

// POST /api/production-rooms - เพิ่มห้องผลิตใหม่
router.post('/', createProductionRoom);

// PUT /api/production-rooms/:id - แก้ไขข้อมูลห้องผลิต
router.put('/:id', updateProductionRoom);

// DELETE /api/production-rooms/:id - ลบห้องผลิต
router.delete('/:id', deleteProductionRoom);

module.exports = router; 