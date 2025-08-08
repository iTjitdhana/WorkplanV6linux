const ProductionLog = require('../models/ProductionLog');

class ProductionLogController {
  // ดึงข้อมูลจากวันล่าสุดที่มีข้อมูล
  static async getLatestProductionData(req, res) {
    try {
      const data = await ProductionLog.getLatestProductionData();
      res.json({
        success: true,
        data: data,
        message: 'ดึงข้อมูลการผลิตล่าสุดสำเร็จ'
      });
    } catch (error) {
      console.error('Error in getLatestProductionData:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message
      });
    }
  }

  // ดึงข้อมูลทั้งหมด
  static async getAll(req, res) {
    try {
      const filters = {
        production_date: req.query.production_date,
        job_code: req.query.job_code,
        job_name: req.query.job_name,
        status: req.query.status,
        operator_name: req.query.operator_name,
        limit: req.query.limit ? parseInt(req.query.limit) : null
      };

      const data = await ProductionLog.getAll(filters);
      res.json({
        success: true,
        data: data,
        message: 'ดึงข้อมูลการผลิตสำเร็จ'
      });
    } catch (error) {
      console.error('Error in getAll:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message
      });
    }
  }

  // ดึงข้อมูลตาม ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await ProductionLog.getById(id);
      
      if (!data) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบข้อมูลการผลิต'
        });
      }

      res.json({
        success: true,
        data: data,
        message: 'ดึงข้อมูลการผลิตสำเร็จ'
      });
    } catch (error) {
      console.error('Error in getById:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message
      });
    }
  }

  // สร้างข้อมูลใหม่
  static async create(req, res) {
    try {
      const logData = {
        work_plan_id: req.body.work_plan_id,
        process_number: req.body.process_number,
        production_date: req.body.production_date,
        job_code: req.body.job_code,
        job_name: req.body.job_name,
        input_material_quantity: req.body.input_material_quantity,
        input_material_unit: req.body.input_material_unit,
        input_material_name: req.body.input_material_name,
        output_quantity: req.body.output_quantity,
        output_unit: req.body.output_unit,
        output_product_name: req.body.output_product_name,
        operator_id: req.body.operator_id,
        operator_name: req.body.operator_name,
        machine_id: req.body.machine_id,
        machine_name: req.body.machine_name,
        production_room_id: req.body.production_room_id,
        room_name: req.body.room_name,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        status: req.body.status,
        notes: req.body.notes
      };

      const id = await ProductionLog.create(logData);
      const createdData = await ProductionLog.getById(id);

      res.status(201).json({
        success: true,
        data: createdData,
        message: 'สร้างข้อมูลการผลิตสำเร็จ'
      });
    } catch (error) {
      console.error('Error in create:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการสร้างข้อมูล: ' + error.message
      });
    }
  }

  // อัปเดตข้อมูล
  static async update(req, res) {
    try {
      const { id } = req.params;
      const logData = {
        work_plan_id: req.body.work_plan_id,
        process_number: req.body.process_number,
        production_date: req.body.production_date,
        job_code: req.body.job_code,
        job_name: req.body.job_name,
        input_material_quantity: req.body.input_material_quantity,
        input_material_unit: req.body.input_material_unit,
        input_material_name: req.body.input_material_name,
        output_quantity: req.body.output_quantity,
        output_unit: req.body.output_unit,
        output_product_name: req.body.output_product_name,
        operator_id: req.body.operator_id,
        operator_name: req.body.operator_name,
        machine_id: req.body.machine_id,
        machine_name: req.body.machine_name,
        production_room_id: req.body.production_room_id,
        room_name: req.body.room_name,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        status: req.body.status,
        notes: req.body.notes
      };

      const success = await ProductionLog.update(id, logData);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบข้อมูลการผลิตที่ต้องการอัปเดต'
        });
      }

      const updatedData = await ProductionLog.getById(id);

      res.json({
        success: true,
        data: updatedData,
        message: 'อัปเดตข้อมูลการผลิตสำเร็จ'
      });
    } catch (error) {
      console.error('Error in update:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ' + error.message
      });
    }
  }

  // ลบข้อมูล
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const success = await ProductionLog.delete(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบข้อมูลการผลิตที่ต้องการลบ'
        });
      }

      res.json({
        success: true,
        message: 'ลบข้อมูลการผลิตสำเร็จ'
      });
    } catch (error) {
      console.error('Error in delete:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message
      });
    }
  }

  // สถิติสรุป
  static async getSummaryStats(req, res) {
    try {
      const date = req.query.date || null;
      const stats = await ProductionLog.getSummaryStats(date);
      
      res.json({
        success: true,
        data: stats,
        message: 'ดึงสถิติสรุปสำเร็จ'
      });
    } catch (error) {
      console.error('Error in getSummaryStats:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงสถิติ: ' + error.message
      });
    }
  }

  // วิเคราะห์ Yield %
  static async getYieldAnalysis(req, res) {
    try {
      const date = req.query.date || null;
      const analysis = await ProductionLog.getYieldAnalysis(date);
      
      res.json({
        success: true,
        data: analysis,
        message: 'ดึงการวิเคราะห์ Yield สำเร็จ'
      });
    } catch (error) {
      console.error('Error in getYieldAnalysis:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการวิเคราะห์ Yield: ' + error.message
      });
    }
  }

  // ดึงข้อมูลสำหรับหน้า Dashboard
  static async getDashboardData(req, res) {
    try {
      const [latestData, summaryStats, yieldAnalysis] = await Promise.all([
        ProductionLog.getLatestProductionData(),
        ProductionLog.getSummaryStats(),
        ProductionLog.getYieldAnalysis()
      ]);

      res.json({
        success: true,
        data: {
          latest_production: latestData,
          summary_stats: summaryStats,
          yield_analysis: yieldAnalysis
        },
        message: 'ดึงข้อมูล Dashboard สำเร็จ'
      });
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard: ' + error.message
      });
    }
  }
}

module.exports = ProductionLogController;
