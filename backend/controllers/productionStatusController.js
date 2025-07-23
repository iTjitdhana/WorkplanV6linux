const ProductionStatus = require('../models/ProductionStatus');
const WorkPlan = require('../models/WorkPlan');

// Get all production statuses
const getAllProductionStatuses = async (req, res) => {
  try {
    const statuses = await ProductionStatus.findAll();
    res.json({
      success: true,
      data: statuses,
      message: 'ดึงรายการสถานะการผลิตสำเร็จ'
    });
  } catch (error) {
    console.error('Error fetching production statuses:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายการสถานะการผลิต',
      error: error.message
    });
  }
};

// Get production status by ID
const getProductionStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await ProductionStatus.findById(id);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสถานะการผลิตที่ระบุ'
      });
    }

    res.json({
      success: true,
      data: status,
      message: 'ดึงข้อมูลสถานะการผลิตสำเร็จ'
    });
  } catch (error) {
    console.error('Error fetching production status:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานะการผลิต',
      error: error.message
    });
  }
};

// Create new production status
const createProductionStatus = async (req, res) => {
  try {
    const { name, description, color, is_active } = req.body;

    // Validation
    if (!name || !color) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อสถานะและสี'
      });
    }

    const newStatus = await ProductionStatus.create({
      name,
      description: description || '',
      color,
      is_active: is_active !== undefined ? is_active : 1
    });

    res.status(201).json({
      success: true,
      data: newStatus,
      message: 'สร้างสถานะการผลิตใหม่สำเร็จ'
    });
  } catch (error) {
    console.error('Error creating production status:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างสถานะการผลิต',
      error: error.message
    });
  }
};

// Update production status
const updateProductionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, is_active } = req.body;

    // Check if status exists
    const existingStatus = await ProductionStatus.findById(id);
    if (!existingStatus) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสถานะการผลิตที่ระบุ'
      });
    }

    // Validation
    if (!name || !color) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อสถานะและสี'
      });
    }

    const updated = await ProductionStatus.update(id, {
      name,
      description: description || '',
      color,
      is_active: is_active !== undefined ? is_active : existingStatus.is_active
    });

    if (updated) {
      const updatedStatus = await ProductionStatus.findById(id);
      res.json({
        success: true,
        data: updatedStatus,
        message: 'อัพเดทสถานะการผลิตสำเร็จ'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'ไม่สามารถอัพเดทสถานะการผลิตได้'
      });
    }
  } catch (error) {
    console.error('Error updating production status:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะการผลิต',
      error: error.message
    });
  }
};

// Delete production status
const deleteProductionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if status exists
    const existingStatus = await ProductionStatus.findById(id);
    if (!existingStatus) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสถานะการผลิตที่ระบุ'
      });
    }

    const deleted = await ProductionStatus.delete(id);

    if (deleted) {
      res.json({
        success: true,
        message: 'ลบสถานะการผลิตสำเร็จ'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบสถานะการผลิตได้'
      });
    }
  } catch (error) {
    console.error('Error deleting production status:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบสถานะการผลิต',
      error: error.message
    });
  }
};

// Update work plan status
const updateWorkPlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_id } = req.body;

    // Validation
    if (!status_id) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุสถานะการผลิต'
      });
    }

    // Check if work plan exists
    const workPlan = await WorkPlan.findById(id);
    if (!workPlan) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบแผนการผลิตที่ระบุ'
      });
    }

    // Check if status exists
    const status = await ProductionStatus.findById(status_id);
    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสถานะการผลิตที่ระบุ'
      });
    }

    // Update work plan status
    const updated = await WorkPlan.updateStatus(id, status_id);

    if (updated) {
      const updatedWorkPlan = await WorkPlan.findById(id);
      res.json({
        success: true,
        data: updatedWorkPlan,
        message: 'อัพเดทสถานะแผนการผลิตสำเร็จ'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'ไม่สามารถอัพเดทสถานะแผนการผลิตได้'
      });
    }
  } catch (error) {
    console.error('Error updating work plan status:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะแผนการผลิต',
      error: error.message
    });
  }
};

// Get active production statuses
const getActiveProductionStatuses = async (req, res) => {
  try {
    const statuses = await ProductionStatus.findActive();
    res.json({
      success: true,
      data: statuses,
      message: 'ดึงรายการสถานะการผลิตที่ใช้งานได้สำเร็จ'
    });
  } catch (error) {
    console.error('Error fetching active production statuses:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายการสถานะการผลิตที่ใช้งานได้',
      error: error.message
    });
  }
};

module.exports = {
  getAllProductionStatuses,
  getProductionStatusById,
  createProductionStatus,
  updateProductionStatus,
  deleteProductionStatus,
  updateWorkPlanStatus,
  getActiveProductionStatuses
}; 