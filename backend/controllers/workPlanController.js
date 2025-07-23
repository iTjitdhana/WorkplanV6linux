const { WorkPlan, DraftWorkPlan } = require('../models/WorkPlan');
const { validationResult } = require('express-validator');

class WorkPlanController {
  // Get all work plans
  static async getAll(req, res) {
    try {
      const { date } = req.query;
      console.log('Requested date:', date);
      console.log('Date type:', typeof date);
      
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
      const { id } = req.params;
      
      // ตรวจสอบว่า work plan มีอยู่หรือไม่
      const workPlan = await WorkPlan.findById(id);
      if (!workPlan) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบแผนการผลิตที่ระบุ'
        });
      }
      
      // อัพเดทสถานะเป็น "ยกเลิกการผลิต" (status_id = 9)
      const updated = await WorkPlan.updateStatus(id, 9);
      
      if (updated) {
        res.json({
          success: true,
          message: 'ยกเลิกการผลิตสำเร็จ'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'ไม่สามารถยกเลิกการผลิตได้'
        });
      }
    } catch (error) {
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