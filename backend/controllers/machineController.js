const Machine = require('../models/Machine');

// ดึงรายการเครื่องทั้งหมด
const getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.findAll();
    res.json({
      success: true,
      data: machines,
      message: 'ดึงรายการเครื่องสำเร็จ'
    });
  } catch (error) {
    console.error('Error in getAllMachines:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายการเครื่อง',
      error: error.message
    });
  }
};

// ดึงข้อมูลเครื่องตาม ID
const getMachineById = async (req, res) => {
  try {
    const { id } = req.params;
    const machine = await Machine.findById(id);
    
    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบเครื่องที่ต้องการ'
      });
    }
    
    res.json({
      success: true,
      data: machine,
      message: 'ดึงข้อมูลเครื่องสำเร็จ'
    });
  } catch (error) {
    console.error('Error in getMachineById:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลเครื่อง',
      error: error.message
    });
  }
};

// ดึงรายการเครื่องตามสถานะ
const getMachinesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['active', 'inactive', 'maintenance'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'สถานะไม่ถูกต้อง'
      });
    }
    
    const machines = await Machine.findByStatus(status);
    res.json({
      success: true,
      data: machines,
      message: `ดึงรายการเครื่องสถานะ ${status} สำเร็จ`
    });
  } catch (error) {
    console.error('Error in getMachinesByStatus:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงรายการเครื่อง',
      error: error.message
    });
  }
};

// เพิ่มเครื่องใหม่
const createMachine = async (req, res) => {
  try {
    const { machine_code, machine_name, machine_type, location, status, description } = req.body;
    
    // Validation
    if (!machine_code || !machine_name || !machine_type) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็น (รหัสเครื่อง, ชื่อเครื่อง, ประเภทเครื่อง)'
      });
    }
    
    // ตรวจสอบว่ารหัสเครื่องซ้ำหรือไม่
    const existingMachine = await Machine.findByCode(machine_code);
    if (existingMachine) {
      return res.status(400).json({
        success: false,
        message: 'รหัสเครื่องนี้มีอยู่ในระบบแล้ว'
      });
    }
    
    const machineData = {
      machine_code,
      machine_name,
      machine_type,
      location,
      status: status || 'active',
      description
    };
    
    const newMachine = await Machine.create(machineData);
    
    res.status(201).json({
      success: true,
      data: newMachine,
      message: 'เพิ่มเครื่องสำเร็จ'
    });
  } catch (error) {
    console.error('Error in createMachine:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มเครื่อง',
      error: error.message
    });
  }
};

// แก้ไขข้อมูลเครื่อง
const updateMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const { machine_code, machine_name, machine_type, location, status, description } = req.body;
    
    // Validation
    if (!machine_code || !machine_name || !machine_type) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็น (รหัสเครื่อง, ชื่อเครื่อง, ประเภทเครื่อง)'
      });
    }
    
    // ตรวจสอบว่าเครื่องมีอยู่หรือไม่
    const existingMachine = await Machine.findById(id);
    if (!existingMachine) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบเครื่องที่ต้องการแก้ไข'
      });
    }
    
    // ตรวจสอบว่ารหัสเครื่องซ้ำหรือไม่ (ยกเว้นเครื่องที่กำลังแก้ไข)
    if (machine_code !== existingMachine.machine_code) {
      const duplicateMachine = await Machine.findByCode(machine_code);
      if (duplicateMachine) {
        return res.status(400).json({
          success: false,
          message: 'รหัสเครื่องนี้มีอยู่ในระบบแล้ว'
        });
      }
    }
    
    const machineData = {
      machine_code,
      machine_name,
      machine_type,
      location,
      status: status || 'active',
      description
    };
    
    const updatedMachine = await Machine.update(id, machineData);
    
    res.json({
      success: true,
      data: updatedMachine,
      message: 'แก้ไขข้อมูลเครื่องสำเร็จ'
    });
  } catch (error) {
    console.error('Error in updateMachine:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลเครื่อง',
      error: error.message
    });
  }
};

// ลบเครื่อง
const deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ตรวจสอบว่าเครื่องมีอยู่หรือไม่
    const existingMachine = await Machine.findById(id);
    if (!existingMachine) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบเครื่องที่ต้องการลบ'
      });
    }
    
    // ตรวจสอบว่าเครื่องถูกใช้งานในงานผลิตหรือไม่
    const isUsed = await Machine.isUsedInWorkPlans(id);
    if (isUsed) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบเครื่องได้เนื่องจากถูกใช้งานในงานผลิต'
      });
    }
    
    await Machine.delete(id);
    
    res.json({
      success: true,
      message: 'ลบเครื่องสำเร็จ'
    });
  } catch (error) {
    console.error('Error in deleteMachine:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบเครื่อง',
      error: error.message
    });
  }
};

module.exports = {
  getAllMachines,
  getMachineById,
  getMachinesByStatus,
  createMachine,
  updateMachine,
  deleteMachine
}; 