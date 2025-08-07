const { WorkPlan, DraftWorkPlan } = require('../models/WorkPlan');
const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

class WorkPlanController {
  // ค้นหางานในระบบ
  static async searchWorkPlans(req, res) {
    try {
      const { code, name } = req.query;
      
      let query = `
        SELECT DISTINCT wp.id, wp.job_code, wp.job_name, wp.production_date
        FROM work_plans wp
        WHERE 1=1
      `;
      const params = [];

      if (code) {
        query += ` AND wp.job_code LIKE ?`;
        params.push(`%${code}%`);
      }

      if (name) {
        query += ` AND wp.job_name LIKE ?`;
        params.push(`%${name}%`);
      }

      query += ` ORDER BY wp.production_date DESC, wp.id DESC LIMIT 20`;

      const [rows] = await pool.query(query, params);
      
      res.json({
        success: true,
        data: rows,
        message: 'ค้นหางานสำเร็จ'
      });
    } catch (error) {
      console.error('Error searching work plans:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการค้นหา'
      });
    }
  }

  // ดึงรายการงานทั้งหมด
  static async getAllWorkPlans(req, res) {
    try {
      const { date } = req.query;
      console.log('Requested date:', date);
      console.log('Date type:', typeof date);
      console.log('Query parameters:', req.query);
      console.log('Full request URL:', req.url);
      console.log('Request headers:', req.headers);
      
      const workPlans = await WorkPlan.getAll(date);
      console.log('Found work plans:', workPlans.length);
      console.log('Work plans data:', workPlans);
      
      res.json({
        success: true,
        data: workPlans,
        message: 'ดึงข้อมูลงานสำเร็จ'
      });
    } catch (error) {
      console.error('Error fetching work plans:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
      });
    }
  }

  // Get all work plans (original method for compatibility)
  static async getAll(req, res) {
    try {
      const { date } = req.query;
      console.log('Requested date:', date);
      console.log('Date type:', typeof date);
      console.log('Query parameters:', req.query);
      console.log('Full request URL:', req.url);
      console.log('Request headers:', req.headers);
      
      const workPlans = await WorkPlan.getAll(date);
      console.log('Found work plans:', workPlans.length);
      console.log('Work plans data:', workPlans);
      
      res.json({
        success: true,
        data: workPlans
      });
    } catch (error) {
      console.error('Error in getAll:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get work plan by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const workPlan = await WorkPlan.getById(id);
      
      if (!workPlan) {
        return res.status(404).json({
          success: false,
          message: 'Work plan not found'
        });
      }
      
      res.json({
        success: true,
        data: workPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new work plan
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      console.log('📝 Creating work plan with data:', req.body);
      console.log('📅 Production date from request:', req.body.production_date);
      console.log('📅 Production date type:', typeof req.body.production_date);

      const workPlan = await WorkPlan.create(req.body);
      
      res.status(201).json({
        success: true,
        data: workPlan,
        message: 'Work plan created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update work plan
  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const workPlan = await WorkPlan.update(id, req.body);
      
      if (!workPlan) {
        return res.status(404).json({
          success: false,
          message: 'Work plan not found'
        });
      }
      
      res.json({
        success: true,
        data: workPlan,
        message: 'Work plan updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete work plan
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      // ตรวจสอบว่า work plan มีอยู่หรือไม่
      const workPlan = await WorkPlan.findById(id);
      if (!workPlan) {
        return res.status(404).json({
          success: false,
          message: 'Work plan not found'
        });
      }
      
      // ป้องกันการลบ work plan (ตามข้อกำหนด After 18:00 Management)
      return res.status(403).json({
        success: false,
        message: 'ไม่สามารถลบงานผลิตได้ เนื่องจากงานในตารางจริงไม่สามารถลบได้หลัง 18:00 น. กรุณาใช้ฟังก์ชัน "ยกเลิกการผลิต" แทน'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mark work plan as finished
  static async markAsFinished(req, res) {
    try {
      const { id } = req.params;
      await WorkPlan.markAsFinished(id);
      
      res.json({
        success: true,
        message: 'Work plan marked as finished'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mark work plan as unfinished
  static async markAsUnfinished(req, res) {
    try {
      const { id } = req.params;
      await WorkPlan.markAsUnfinished(id);
      
      res.json({
        success: true,
        message: 'Work plan marked as unfinished'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cancel production (ยกเลิกการผลิต)
  static async cancelProduction(req, res) {
    try {
      console.log('🔴 [DEBUG] cancelProduction called');
      const { id } = req.params;
      console.log('🔴 [DEBUG] Work plan ID:', id);
      
      // ตรวจสอบว่า work plan มีอยู่หรือไม่
      const workPlan = await WorkPlan.findById(id);
      console.log('🔴 [DEBUG] Found work plan:', workPlan);
      
      if (!workPlan) {
        console.log('🔴 [DEBUG] Work plan not found');
        return res.status(404).json({
          success: false,
          message: 'ไม่พบแผนการผลิตที่ระบุ'
        });
      }
      
      // อัพเดทสถานะเป็น "ยกเลิกการผลิต" (status_id = 9)
      console.log('🔴 [DEBUG] Updating status to 9 (ยกเลิกการผลิต)');
      const updated = await WorkPlan.updateStatus(id, 9);
      console.log('🔴 [DEBUG] Update result:', updated);
      
      if (updated) {
        console.log('🔴 [DEBUG] Cancel successful');
        res.json({
          success: true,
          message: 'ยกเลิกการผลิตสำเร็จ'
        });
      } else {
        console.log('🔴 [DEBUG] Cancel failed');
        res.status(400).json({
          success: false,
          message: 'ไม่สามารถยกเลิกการผลิตได้'
        });
      }
    } catch (error) {
      console.error('🔴 [DEBUG] Error in cancelProduction:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update work plan status
  static async updateStatus(req, res) {
    try {
      console.log('🔄 [DEBUG] updateStatus called');
      const { id } = req.params;
      const { status_id } = req.body;
      
      console.log('🔄 [DEBUG] Work plan ID:', id);
      console.log('🔄 [DEBUG] New status ID:', status_id);
      
      if (!status_id) {
        return res.status(400).json({
          success: false,
          message: 'status_id is required'
        });
      }
      
      const workPlan = await WorkPlan.findById(id);
      if (!workPlan) {
        console.log('🔄 [DEBUG] Work plan not found');
        return res.status(404).json({
          success: false,
          message: 'Work plan not found'
        });
      }
      
      console.log('🔄 [DEBUG] Found work plan:', workPlan);
      console.log('🔄 [DEBUG] Updating status to', status_id);
      
      const updated = await WorkPlan.updateStatus(id, status_id);
      console.log('🔄 [DEBUG] Update result:', updated);
      
      if (!updated) {
        console.log('🔄 [DEBUG] Update failed');
        return res.status(500).json({
          success: false,
          message: 'Failed to update work plan status'
        });
      }
      
      console.log('🔄 [DEBUG] Successfully updated status');
      res.json({
        success: true,
        message: 'Work plan status updated successfully'
      });
    } catch (error) {
      console.error('🔄 [DEBUG] Error in updateStatus:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

// เพิ่ม controller สำหรับ draft
class DraftWorkPlanController {
  static async getAll(req, res) {
    const drafts = await DraftWorkPlan.getAll();
    console.log('📅 Retrieved drafts:', drafts);
    res.json({ success: true, data: drafts });
  }
  static async getById(req, res) {
    const draft = await DraftWorkPlan.getById(req.params.id);
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found' });
    res.json({ success: true, data: draft });
  }
  static async create(req, res) {
    console.log('📅 Creating draft with data:', req.body);
    console.log('📅 production_date:', req.body.production_date);
    console.log('📅 production_date type:', typeof req.body.production_date);
    
    const draft = await DraftWorkPlan.create(req.body);
    console.log('📅 Created draft:', draft);
    
    res.status(201).json({ success: true, data: draft });
  }
  static async update(req, res) {
    console.log('📝 Updating draft with ID:', req.params.id);
    console.log('📝 Request body:', req.body);
    console.log('📝 workflow_status_id:', req.body.workflow_status_id);
    
    const draft = await DraftWorkPlan.update(req.params.id, req.body);
    console.log('📝 Updated draft:', draft);
    
    res.json({ success: true, data: draft });
  }
  static async delete(req, res) {
    await DraftWorkPlan.delete(req.params.id);
    res.json({ success: true });
  }
  static async syncDraftsToPlans(req, res) {
    try {
      console.log('🔄 [DEBUG] syncDraftsToPlans called');
      const { targetDate } = req.body; // รับวันที่จาก request body
      if (!targetDate) {
        console.log('🔄 [DEBUG] targetDate is missing in request body:', req.body);
      } else {
        console.log('🔄 [DEBUG] targetDate:', targetDate);
      }
      
      const result = await DraftWorkPlan.syncDraftsToPlans(targetDate);
      
      console.log('🔄 [DEBUG] Sync result:', result);
      
      // ปรับ message ตามว่ามีการระบุวันที่หรือไม่
      let message = result.message;
      if (targetDate) {
        message = `Sync สำเร็จ ${result.synced} รายการสำหรับวันที่ ${targetDate}`;
      }
      
      console.log('🔄 [DEBUG] Final message:', message);
      
      res.json({
        success: true,
        data: result,
        message: message
      });
    } catch (error) {
      console.error('Error in syncDraftsToPlans:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = { WorkPlanController, DraftWorkPlanController }; 