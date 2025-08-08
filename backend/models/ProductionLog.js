const { pool } = require('../config/database');

class ProductionLog {
  // ดึงข้อมูลจากวันล่าสุดที่มีข้อมูล
  static async getLatestProductionData() {
    try {
      const query = `
        SELECT 
          pl.*,
          wp.start_time as planned_start_time,
          wp.end_time as planned_end_time,
          ps.process_description
        FROM production_logs pl
        LEFT JOIN work_plans wp ON pl.work_plan_id = wp.id
        LEFT JOIN process_steps ps ON pl.job_code = ps.job_code AND pl.process_number = ps.process_number
        WHERE pl.production_date = (
          SELECT MAX(production_date) 
          FROM production_logs 
          WHERE production_date <= CURDATE()
        )
        ORDER BY pl.created_at DESC
      `;
      
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching latest production data: ${error.message}`);
    }
  }

  // ดึงข้อมูลทั้งหมดพร้อม filter
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          pl.*,
          wp.start_time as planned_start_time,
          wp.end_time as planned_end_time,
          ps.process_description,
          u.name as operator_full_name
        FROM production_logs pl
        LEFT JOIN work_plans wp ON pl.work_plan_id = wp.id
        LEFT JOIN process_steps ps ON pl.job_code = ps.job_code AND pl.process_number = ps.process_number
        LEFT JOIN users u ON pl.operator_id = u.id
      `;
      
      const params = [];
      const conditions = [];
      
      if (filters.production_date) {
        conditions.push('pl.production_date = ?');
        params.push(filters.production_date);
      }
      
      if (filters.job_code) {
        conditions.push('pl.job_code LIKE ?');
        params.push(`%${filters.job_code}%`);
      }
      
      if (filters.job_name) {
        conditions.push('pl.job_name LIKE ?');
        params.push(`%${filters.job_name}%`);
      }
      
      if (filters.status) {
        conditions.push('pl.status = ?');
        params.push(filters.status);
      }
      
      if (filters.operator_name) {
        conditions.push('pl.operator_name LIKE ?');
        params.push(`%${filters.operator_name}%`);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY pl.production_date DESC, pl.created_at DESC';
      
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching production logs: ${error.message}`);
    }
  }

  // สร้าง production log ใหม่
  static async create(logData) {
    try {
      const query = `
        INSERT INTO production_logs (
          work_plan_id, process_number, production_date, job_code, job_name,
          input_material_quantity, input_material_unit, input_material_name,
          output_quantity, output_unit, output_product_name,
          operator_id, operator_name, machine_id, machine_name,
          production_room_id, room_name, start_time, end_time, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        logData.work_plan_id || null,
        logData.process_number || null,
        logData.production_date,
        logData.job_code,
        logData.job_name,
        logData.input_material_quantity || 0,
        logData.input_material_unit || '',
        logData.input_material_name || '',
        logData.output_quantity || 0,
        logData.output_unit || '',
        logData.output_product_name || '',
        logData.operator_id || null,
        logData.operator_name || '',
        logData.machine_id || null,
        logData.machine_name || '',
        logData.production_room_id || null,
        logData.room_name || '',
        logData.start_time || null,
        logData.end_time || null,
        logData.status || 'pending',
        logData.notes || ''
      ];
      
      const [result] = await pool.execute(query, params);
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating production log: ${error.message}`);
    }
  }

  // อัปเดต production log
  static async update(id, logData) {
    try {
      const query = `
        UPDATE production_logs SET
          work_plan_id = ?,
          process_number = ?,
          production_date = ?,
          job_code = ?,
          job_name = ?,
          input_material_quantity = ?,
          input_material_unit = ?,
          input_material_name = ?,
          output_quantity = ?,
          output_unit = ?,
          output_product_name = ?,
          operator_id = ?,
          operator_name = ?,
          machine_id = ?,
          machine_name = ?,
          production_room_id = ?,
          room_name = ?,
          start_time = ?,
          end_time = ?,
          status = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const params = [
        logData.work_plan_id || null,
        logData.process_number || null,
        logData.production_date,
        logData.job_code,
        logData.job_name,
        logData.input_material_quantity || 0,
        logData.input_material_unit || '',
        logData.input_material_name || '',
        logData.output_quantity || 0,
        logData.output_unit || '',
        logData.output_product_name || '',
        logData.operator_id || null,
        logData.operator_name || '',
        logData.machine_id || null,
        logData.machine_name || '',
        logData.production_room_id || null,
        logData.room_name || '',
        logData.start_time || null,
        logData.end_time || null,
        logData.status || 'pending',
        logData.notes || '',
        id
      ];
      
      const [result] = await pool.execute(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating production log: ${error.message}`);
    }
  }

  // ลบ production log
  static async delete(id) {
    try {
      const query = 'DELETE FROM production_logs WHERE id = ?';
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting production log: ${error.message}`);
    }
  }

  // ดึงข้อมูลตาม ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          pl.*,
          wp.start_time as planned_start_time,
          wp.end_time as planned_end_time,
          ps.process_description,
          u.name as operator_full_name
        FROM production_logs pl
        LEFT JOIN work_plans wp ON pl.work_plan_id = wp.id
        LEFT JOIN process_steps ps ON pl.job_code = ps.job_code AND pl.process_number = ps.process_number
        LEFT JOIN users u ON pl.operator_id = u.id
        WHERE pl.id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching production log by ID: ${error.message}`);
    }
  }

  // สถิติสรุป
  static async getSummaryStats(date = null) {
    try {
      const dateFilter = date ? 'WHERE production_date = ?' : '';
      const params = date ? [date] : [];
      
      const query = `
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_jobs,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_jobs,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_jobs,
          AVG(yield_percentage) as avg_yield_percentage,
          SUM(input_material_quantity) as total_input_quantity,
          SUM(output_quantity) as total_output_quantity,
          AVG(duration_minutes) as avg_duration_minutes
        FROM production_logs
        ${dateFilter}
      `;
      
      const [rows] = await pool.execute(query, params);
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching summary stats: ${error.message}`);
    }
  }

  // ดึงข้อมูล Yield % สูงสุด-ต่ำสุด
  static async getYieldAnalysis(date = null) {
    try {
      const dateFilter = date ? 'WHERE production_date = ?' : '';
      const params = date ? [date] : [];
      
      const query = `
        SELECT 
          job_code,
          job_name,
          AVG(yield_percentage) as avg_yield,
          MAX(yield_percentage) as max_yield,
          MIN(yield_percentage) as min_yield,
          COUNT(*) as job_count
        FROM production_logs
        ${dateFilter}
        GROUP BY job_code, job_name
        ORDER BY avg_yield DESC
      `;
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching yield analysis: ${error.message}`);
    }
  }
}

module.exports = ProductionLog;
