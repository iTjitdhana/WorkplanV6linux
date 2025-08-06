const { pool } = require('../config/database');
const WorkPlan = require('../models/WorkPlan');
const ProcessStep = require('../models/ProcessStep');

class NewJobsController {
  // ดึงรายการงานที่มี job_code = "NEW"
  static async getNewJobs(req, res) {
    try {
      const query = `
        SELECT DISTINCT wp.id, wp.job_code, wp.job_name, wp.production_date
        FROM work_plans wp
        WHERE wp.job_code = 'NEW'
        ORDER BY wp.production_date DESC, wp.id DESC
      `;
      
      const [rows] = await pool.query(query);
      
      res.json({
        success: true,
        data: rows,
        message: 'ดึงข้อมูลงานใหม่สำเร็จ'
      });
    } catch (error) {
      console.error('Error fetching new jobs:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลงานใหม่'
      });
    }
  }

  // ดึง Process Steps สำหรับงานที่ระบุ
  static async getProcessSteps(req, res) {
    try {
      const { job_code, job_name } = req.query;
      
      if (!job_code || !job_name) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ job_code และ job_name'
        });
      }

      const query = `
        SELECT * FROM process_steps 
        WHERE job_code = ? AND job_name = ?
        ORDER BY process_number ASC
      `;
      
      const [rows] = await pool.query(query, [job_code, job_name]);
      
      res.json({
        success: true,
        data: rows,
        message: 'ดึงข้อมูล Process Steps สำเร็จ'
      });
    } catch (error) {
      console.error('Error fetching process steps:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Process Steps'
      });
    }
  }

  // อัปเดตข้อมูลงาน (job_code, job_name) และ Process Steps
  static async updateNewJob(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { 
        work_plan_id, 
        new_job_code, 
        new_job_name, 
        process_steps 
      } = req.body;

      if (!work_plan_id || !new_job_code || !new_job_name) {
        return res.status(400).json({
          success: false,
          message: 'กรุณาระบุ work_plan_id, new_job_code, และ new_job_name'
        });
      }

      // 1. อัปเดต work_plans
      const updateWorkPlanQuery = `
        UPDATE work_plans 
        SET job_code = ?, job_name = ?
        WHERE id = ? AND job_code = 'NEW'
      `;
      
      const [workPlanResult] = await connection.query(updateWorkPlanQuery, [
        new_job_code, 
        new_job_name, 
        work_plan_id
      ]);

      if (workPlanResult.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'ไม่พบงานที่ต้องการอัปเดต หรืองานนี้ไม่ใช่ NEW'
        });
      }

      // 2. ลบ Process Steps เดิม (ถ้ามี)
      const deleteProcessStepsQuery = `
        DELETE ps FROM process_steps ps
        INNER JOIN work_plans wp ON ps.job_code = wp.job_code AND ps.job_name = wp.job_name
        WHERE wp.id = ? AND wp.job_code = 'NEW'
      `;
      
      await connection.query(deleteProcessStepsQuery, [work_plan_id]);

      // 3. เพิ่ม Process Steps ใหม่ (ถ้ามี)
      if (process_steps && Array.isArray(process_steps) && process_steps.length > 0) {
        const insertProcessStepsQuery = `
          INSERT INTO process_steps 
          (job_code, job_name, date_recorded, worker_count, process_number, process_description)
          VALUES (?, ?, CURDATE(), ?, ?, ?)
        `;

        for (const step of process_steps) {
          if (step.process_description && step.process_number) {
            await connection.query(insertProcessStepsQuery, [
              new_job_code,
              new_job_name,
              step.worker_count || null,
              step.process_number,
              step.process_description
            ]);
          }
        }
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'อัปเดตข้อมูลงานและ Process Steps สำเร็จ'
      });

    } catch (error) {
      await connection.rollback();
      console.error('Error updating new job:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล'
      });
    } finally {
      connection.release();
    }
  }

  // ลบงานที่มี job_code = "NEW"
  static async deleteNewJob(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { work_plan_id } = req.params;

      // 1. ลบ Process Steps ที่เกี่ยวข้อง
      const deleteProcessStepsQuery = `
        DELETE ps FROM process_steps ps
        INNER JOIN work_plans wp ON ps.job_code = wp.job_code AND ps.job_name = wp.job_name
        WHERE wp.id = ? AND wp.job_code = 'NEW'
      `;
      
      await connection.query(deleteProcessStepsQuery, [work_plan_id]);

      // 2. ลบงานจาก work_plans
      const deleteWorkPlanQuery = `
        DELETE FROM work_plans 
        WHERE id = ? AND job_code = 'NEW'
      `;
      
      const [result] = await connection.query(deleteWorkPlanQuery, [work_plan_id]);

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'ไม่พบงานที่ต้องการลบ หรืองานนี้ไม่ใช่ NEW'
        });
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'ลบงานสำเร็จ'
      });

    } catch (error) {
      await connection.rollback();
      console.error('Error deleting new job:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการลบงาน'
      });
    } finally {
      connection.release();
    }
  }
}

module.exports = NewJobsController; 