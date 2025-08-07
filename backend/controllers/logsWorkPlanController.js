const LogsWorkPlan = require('../models/LogsWorkPlan');
const WorkPlan = require('../models/WorkPlan');
const { Op } = require('sequelize');

// Get all logs with filtering
const getLogs = async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      job_code, 
      job_name,
      page = 1,
      limit = 50
    } = req.query;

    const whereClause = {};
    
    // Date filter
    if (start_date && end_date) {
      whereClause.production_date = {
        [Op.between]: [start_date, end_date]
      };
    } else if (start_date) {
      whereClause.production_date = {
        [Op.gte]: start_date
      };
    } else if (end_date) {
      whereClause.production_date = {
        [Op.lte]: end_date
      };
    }

    // Job filter
    if (job_code) {
      whereClause.job_code = {
        [Op.like]: `%${job_code}%`
      };
    }

    if (job_name) {
      whereClause.job_name = {
        [Op.like]: `%${job_name}%`
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await LogsWorkPlan.findAndCountAll({
      where: whereClause,
      order: [['production_date', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting logs:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message
    });
  }
};

// Get logs by date
const getLogsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    const logs = await LogsWorkPlan.findAll({
      where: {
        production_date: date
      },
      order: [['job_name', 'ASC']]
    });

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error getting logs by date:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message
    });
  }
};

// Get work plans for a specific date
const getWorkPlansByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    const workPlans = await WorkPlan.findAll({
      where: {
        production_date: date
      },
      order: [['job_name', 'ASC']]
    });

    res.json({
      success: true,
      data: workPlans
    });
  } catch (error) {
    console.error('Error getting work plans by date:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message
    });
  }
};

// Get previous material data for auto-fill
const getPreviousMaterialData = async (req, res) => {
  try {
    const { job_code } = req.params;
    
    const previousData = await LogsWorkPlan.findOne({
      where: {
        job_code: job_code,
        input_material_quantity: {
          [Op.not]: null
        }
      },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: previousData ? {
        input_material_quantity: previousData.input_material_quantity,
        input_material_unit: previousData.input_material_unit,
        output_unit: previousData.output_unit
      } : null
    });
  } catch (error) {
    console.error('Error getting previous material data:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: error.message
    });
  }
};

// Create new log
const createLog = async (req, res) => {
  try {
    const {
      work_plan_id,
      production_date,
      job_code,
      job_name,
      input_material_quantity,
      input_material_unit,
      output_quantity,
      output_unit,
      notes
    } = req.body;

    // Check if log already exists for this work plan and date
    const existingLog = await LogsWorkPlan.findOne({
      where: {
        work_plan_id: work_plan_id,
        production_date: production_date
      }
    });

    if (existingLog) {
      return res.status(400).json({
        success: false,
        message: 'มีการบันทึกข้อมูลสำหรับงานนี้ในวันที่เลือกแล้ว'
      });
    }

    const newLog = await LogsWorkPlan.create({
      work_plan_id,
      production_date,
      job_code,
      job_name,
      input_material_quantity,
      input_material_unit,
      output_quantity,
      output_unit,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'บันทึกข้อมูลสำเร็จ',
      data: newLog
    });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      error: error.message
    });
  }
};

// Update log
const updateLog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const log = await LogsWorkPlan.findByPk(id);
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลที่ต้องการแก้ไข'
      });
    }

    await log.update(updateData);

    res.json({
      success: true,
      message: 'แก้ไขข้อมูลสำเร็จ',
      data: log
    });
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล',
      error: error.message
    });
  }
};

// Delete log
const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await LogsWorkPlan.findByPk(id);
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลที่ต้องการลบ'
      });
    }

    await log.destroy();

    res.json({
      success: true,
      message: 'ลบข้อมูลสำเร็จ'
    });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบข้อมูล',
      error: error.message
    });
  }
};

// Bulk create logs
const bulkCreateLogs = async (req, res) => {
  try {
    const { logs } = req.body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ข้อมูลไม่ถูกต้อง'
      });
    }

    const createdLogs = await LogsWorkPlan.bulkCreate(logs, {
      ignoreDuplicates: true
    });

    res.status(201).json({
      success: true,
      message: `บันทึกข้อมูลสำเร็จ ${createdLogs.length} รายการ`,
      data: createdLogs
    });
  } catch (error) {
    console.error('Error bulk creating logs:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      error: error.message
    });
  }
};

module.exports = {
  getLogs,
  getLogsByDate,
  getWorkPlansByDate,
  getPreviousMaterialData,
  createLog,
  updateLog,
  deleteLog,
  bulkCreateLogs
};
