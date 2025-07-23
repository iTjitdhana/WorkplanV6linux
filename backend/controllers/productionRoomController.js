const ProductionRoom = require('../models/ProductionRoom');

// ดึงรายการห้องผลิตทั้งหมด
const getAllProductionRooms = async (req, res) => {
  try {
    const rooms = await ProductionRoom.findAll();
    res.json({
      success: true,
      data: rooms,
      message: 'ดึงรายการห้องผลิตสำเร็จ'
    });
  } catch (error) {
    console.error('Error in getAllProductionRooms:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายการห้องผลิต',
      error: error.message
    });
  }
};

// ดึงข้อมูลห้องผลิตตาม ID
const getProductionRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await ProductionRoom.findById(id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องผลิตที่ต้องการ'
      });
    }
    
    res.json({
      success: true,
      data: room,
      message: 'ดึงข้อมูลห้องผลิตสำเร็จ'
    });
  } catch (error) {
    console.error('Error in getProductionRoomById:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลห้องผลิต',
      error: error.message
    });
  }
};

// ดึงรายการห้องผลิตตามประเภท
const getProductionRoomsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['hot_kitchen', 'cold_kitchen', 'prep_area', 'storage', 'other'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'ประเภทห้องผลิตไม่ถูกต้อง'
      });
    }
    
    const rooms = await ProductionRoom.findByType(type);
    res.json({
      success: true,
      data: rooms,
      message: `ดึงรายการห้องผลิตประเภท ${type} สำเร็จ`
    });
  } catch (error) {
    console.error('Error in getProductionRoomsByType:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายการห้องผลิต',
      error: error.message
    });
  }
};

// ดึงรายการห้องผลิตตามสถานะ
const getProductionRoomsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['active', 'inactive', 'maintenance'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'สถานะไม่ถูกต้อง'
      });
    }
    
    const rooms = await ProductionRoom.findByStatus(status);
    res.json({
      success: true,
      data: rooms,
      message: `ดึงรายการห้องผลิตสถานะ ${status} สำเร็จ`
    });
  } catch (error) {
    console.error('Error in getProductionRoomsByStatus:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายการห้องผลิต',
      error: error.message
    });
  }
};

// เพิ่มห้องผลิตใหม่
const createProductionRoom = async (req, res) => {
  try {
    const { room_code, room_name, room_type, capacity, location, status, description } = req.body;
    
    // Validation
    if (!room_code || !room_name || !room_type) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็น (รหัสห้อง, ชื่อห้อง, ประเภทห้อง)'
      });
    }
    
    // ตรวจสอบประเภทห้องผลิต
    const validTypes = ['hot_kitchen', 'cold_kitchen', 'prep_area', 'storage', 'other'];
    if (!validTypes.includes(room_type)) {
      return res.status(400).json({
        success: false,
        message: 'ประเภทห้องผลิตไม่ถูกต้อง'
      });
    }
    
    // ตรวจสอบว่ารหัสห้องซ้ำหรือไม่
    const existingRoom = await ProductionRoom.findByCode(room_code);
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'รหัสห้องผลิตนี้มีอยู่ในระบบแล้ว'
      });
    }
    
    const roomData = {
      room_code,
      room_name,
      room_type,
      capacity: capacity || null,
      location,
      status: status || 'active',
      description
    };
    
    const newRoom = await ProductionRoom.create(roomData);
    
    res.status(201).json({
      success: true,
      data: newRoom,
      message: 'เพิ่มห้องผลิตสำเร็จ'
    });
  } catch (error) {
    console.error('Error in createProductionRoom:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มห้องผลิต',
      error: error.message
    });
  }
};

// แก้ไขข้อมูลห้องผลิต
const updateProductionRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_code, room_name, room_type, capacity, location, status, description } = req.body;
    
    // Validation
    if (!room_code || !room_name || !room_type) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็น (รหัสห้อง, ชื่อห้อง, ประเภทห้อง)'
      });
    }
    
    // ตรวจสอบประเภทห้องผลิต
    const validTypes = ['hot_kitchen', 'cold_kitchen', 'prep_area', 'storage', 'other'];
    if (!validTypes.includes(room_type)) {
      return res.status(400).json({
        success: false,
        message: 'ประเภทห้องผลิตไม่ถูกต้อง'
      });
    }
    
    // ตรวจสอบว่าห้องผลิตมีอยู่หรือไม่
    const existingRoom = await ProductionRoom.findById(id);
    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องผลิตที่ต้องการแก้ไข'
      });
    }
    
    // ตรวจสอบว่ารหัสห้องซ้ำหรือไม่ (ยกเว้นห้องที่กำลังแก้ไข)
    if (room_code !== existingRoom.room_code) {
      const duplicateRoom = await ProductionRoom.findByCode(room_code);
      if (duplicateRoom) {
        return res.status(400).json({
          success: false,
          message: 'รหัสห้องผลิตนี้มีอยู่ในระบบแล้ว'
        });
      }
    }
    
    const roomData = {
      room_code,
      room_name,
      room_type,
      capacity: capacity || null,
      location,
      status: status || 'active',
      description
    };
    
    const updatedRoom = await ProductionRoom.update(id, roomData);
    
    res.json({
      success: true,
      data: updatedRoom,
      message: 'แก้ไขข้อมูลห้องผลิตสำเร็จ'
    });
  } catch (error) {
    console.error('Error in updateProductionRoom:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลห้องผลิต',
      error: error.message
    });
  }
};

// ลบห้องผลิต
const deleteProductionRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ตรวจสอบว่าห้องผลิตมีอยู่หรือไม่
    const existingRoom = await ProductionRoom.findById(id);
    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบห้องผลิตที่ต้องการลบ'
      });
    }
    
    // ตรวจสอบว่าห้องผลิตถูกใช้งานในงานผลิตหรือไม่
    const isUsed = await ProductionRoom.isUsedInWorkPlans(id);
    if (isUsed) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบห้องผลิตได้เนื่องจากถูกใช้งานในงานผลิต'
      });
    }
    
    await ProductionRoom.delete(id);
    
    res.json({
      success: true,
      message: 'ลบห้องผลิตสำเร็จ'
    });
  } catch (error) {
    console.error('Error in deleteProductionRoom:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบห้องผลิต',
      error: error.message
    });
  }
};

module.exports = {
  getAllProductionRooms,
  getProductionRoomById,
  getProductionRoomsByType,
  getProductionRoomsByStatus,
  createProductionRoom,
  updateProductionRoom,
  deleteProductionRoom
}; 