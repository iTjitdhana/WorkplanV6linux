const { pool } = require('../config/database');

class Log {
  // Get all logs with work plan details
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          l.id,
          l.work_plan_id,
          l.process_number,
          l.status,
          l.timestamp,
          wp.job_code,
          wp.job_name,
          wp.production_date,
          ps.process_description
        FROM logs l
        LEFT JOIN work_plans wp ON l.work_plan_id = wp.id
        LEFT JOIN process_steps ps ON wp.job_code = ps.job_code AND l.process_number = ps.process_number
      `;
      
      const params = [];
      const conditions = [];
      
      if (filters.work_plan_id) {
        conditions.push('l.work_plan_id = ?');
        params.push(filters.work_plan_id);
      }
      
      if (filters.date) {
        conditions.push('DATE(l.timestamp) = ?');
        params.push(filters.date);
      }
      
      if (filters.status) {
        conditions.push('l.status = ?');
        params.push(filters.status);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY l.timestamp DESC';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching logs: ${error.message}`);
    }
  }

  // Get logs by work plan ID
  static async getByWorkPlanId(workPlanId) {
    try {
      console.log('[DEBUG] Log.getByWorkPlanId called with workPlanId:', workPlanId);
      const query = `
        SELECT 
          l.id,
          l.work_plan_id,
          l.process_number,
          l.status,
          l.timestamp,
          ps.process_description
        FROM logs l
        LEFT JOIN work_plans wp ON l.work_plan_id = wp.id
        LEFT JOIN process_steps ps ON wp.job_code = ps.job_code AND l.process_number = ps.process_number
        WHERE l.work_plan_id = ?
        ORDER BY l.process_number, l.timestamp
      `;
      
      const [rows] = await pool.execute(query, [workPlanId]);
      console.log('[DEBUG] Raw logs from database:', rows);
      
      // จัดกลุ่ม logs ตาม process_number และคำนวณ start_time, stop_time, used_time
      const processMap = new Map();
      
      rows.forEach(row => {
        const processNumber = row.process_number;
        if (!processMap.has(processNumber)) {
          processMap.set(processNumber, {
            process_number: processNumber,
            process_description: row.process_description,
            start_time: null,
            stop_time: null,
            used_time: null,
            logs: []
          });
        }
        
        const processData = processMap.get(processNumber);
        processData.logs.push(row);
        
        if (row.status === 'start') {
          processData.start_time = row.timestamp;
        } else if (row.status === 'stop') {
          processData.stop_time = row.timestamp;
        }
      });
      
      // คำนวณ used_time สำหรับแต่ละ process
      const result = Array.from(processMap.values()).map(processData => {
        if (processData.start_time && processData.stop_time) {
          const startTime = new Date(processData.start_time);
          const stopTime = new Date(processData.stop_time);
          processData.used_time = Math.floor((stopTime - startTime) / 1000); // seconds
        }
        
        // ลบ logs array ออกเพื่อไม่ให้ response ใหญ่เกินไป
        delete processData.logs;
        
        return processData;
      });
      
      console.log('[DEBUG] Processed logs result:', result);
      return result;
    } catch (error) {
      console.error('[DEBUG] Error in Log.getByWorkPlanId:', error);
      throw new Error(`Error fetching logs for work plan: ${error.message}`);
    }
  }

  // Get log by ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          l.id,
          l.work_plan_id,
          l.process_number,
          l.status,
          l.timestamp,
          wp.job_code,
          wp.job_name,
          wp.production_date,
          ps.process_description
        FROM logs l
        LEFT JOIN work_plans wp ON l.work_plan_id = wp.id
        LEFT JOIN process_steps ps ON wp.job_code = ps.job_code AND l.process_number = ps.process_number
        WHERE l.id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error fetching log: ${error.message}`);
    }
  }

  // Create new log
  static async create(logData) {
    try {
      console.log('[DEBUG] Log.create called with logData:', logData);
      const { work_plan_id, process_number, status, timestamp } = logData;
      let query, params, result, finalTimestamp;

      if (timestamp) {
        // ถ้ามี timestamp ที่ส่งมา ให้แปลงเป็นเวลาประเทศไทย
        const d = new Date(timestamp);
        finalTimestamp = new Date(d.getTime() + 7 * 60 * 60 * 1000);
        query = `
          INSERT INTO logs (work_plan_id, process_number, status, timestamp)
          VALUES (?, ?, ?, ?)
        `;
        params = [work_plan_id, process_number, status, finalTimestamp];
        console.log('[DEBUG] Using timestamp branch - params:', params);
      } else {
        // ถ้าไม่ส่ง timestamp มา ใช้เวลาปัจจุบันของไทย
        query = `
          INSERT INTO logs (work_plan_id, process_number, status, timestamp)
          VALUES (?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Asia/Bangkok'))
        `;
        params = [work_plan_id, process_number, status];
        finalTimestamp = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
        console.log('[DEBUG] Using NOW() branch - params:', params);
      }

      console.log('[DEBUG] About to execute query:', query);
      [result] = await pool.execute(query, params);
      console.log('[DEBUG] Insert result:', result);

      const returnData = {
        id: result.insertId,
        work_plan_id,
        process_number,
        status,
        timestamp: finalTimestamp
      };
      console.log('[DEBUG] Returning data:', returnData);
      return returnData;
    } catch (error) {
      console.error('[DEBUG] Error in Log.create:', error);
      throw new Error(`Error creating log: ${error.message}`);
    }
  }

  // Update log
  static async update(id, logData) {
    try {
      const { work_plan_id, process_number, status, timestamp } = logData;
      
      const query = `
        UPDATE logs 
        SET work_plan_id = ?, process_number = ?, status = ?, timestamp = ?
        WHERE id = ?
      `;
      
      const [result] = await pool.execute(query, [
        work_plan_id, process_number, status, timestamp, id
      ]);
      
      return result.affectedRows > 0 ? { id, ...logData } : null;
    } catch (error) {
      throw new Error(`Error updating log: ${error.message}`);
    }
  }

  // Delete log
  static async delete(id) {
    try {
      const query = 'DELETE FROM logs WHERE id = ?';
      const [result] = await pool.execute(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting log: ${error.message}`);
    }
  }

  // Start process
  static async startProcess(workPlanId, processNumber) {
    try {
      const query = `
        INSERT INTO logs (work_plan_id, process_number, status, timestamp)
        VALUES (?, ?, 'start', NOW())
      `;
      
      const [result] = await pool.execute(query, [workPlanId, processNumber]);
      
      return { 
        id: result.insertId, 
        work_plan_id: workPlanId, 
        process_number: processNumber, 
        status: 'start',
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Error starting process: ${error.message}`);
    }
  }

  // Stop process
  static async stopProcess(workPlanId, processNumber) {
    try {
      const query = `
        INSERT INTO logs (work_plan_id, process_number, status, timestamp)
        VALUES (?, ?, 'stop', NOW())
      `;
      
      const [result] = await pool.execute(query, [workPlanId, processNumber]);
      
      return { 
        id: result.insertId, 
        work_plan_id: workPlanId, 
        process_number: processNumber, 
        status: 'stop',
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Error stopping process: ${error.message}`);
    }
  }

  // Get process status for work plan
  static async getProcessStatus(workPlanId) {
    try {
      const query = `
        SELECT 
          l.process_number,
          l.status,
          l.timestamp,
          ps.process_description
        FROM logs l
        LEFT JOIN work_plans wp ON l.work_plan_id = wp.id
        LEFT JOIN process_steps ps ON wp.job_code = ps.job_code AND l.process_number = ps.process_number
        WHERE l.work_plan_id = ? AND l.id IN (
          SELECT MAX(id) FROM logs 
          WHERE work_plan_id = ? 
          GROUP BY process_number
        )
        ORDER BY l.process_number
      `;
      
      const [rows] = await pool.execute(query, [workPlanId, workPlanId]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching process status: ${error.message}`);
    }
  }

  // Get production summary by date
  static async getProductionSummary(date) {
    try {
      const query = `
        SELECT 
          wp.job_code,
          wp.job_name,
          COUNT(DISTINCT l.process_number) as processes_started,
          SUM(CASE WHEN l.status = 'start' THEN 1 ELSE 0 END) as total_starts,
          SUM(CASE WHEN l.status = 'stop' THEN 1 ELSE 0 END) as total_stops,
          MIN(l.timestamp) as first_start,
          MAX(l.timestamp) as last_activity
        FROM logs l
        JOIN work_plans wp ON l.work_plan_id = wp.id
        WHERE DATE(l.timestamp) = ?
        GROUP BY wp.job_code, wp.job_name
        ORDER BY wp.job_code
      `;
      
      const [rows] = await pool.execute(query, [date]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching production summary: ${error.message}`);
    }
  }

  // Get work plan status based on logs
  static async getWorkPlanStatus(workPlanId) {
    try {
      console.log(`[DEBUG] Getting status for work plan ID: ${workPlanId}`);
      
      // ตรวจสอบว่ามี logs สำหรับ work plan นี้หรือไม่
      const hasLogsQuery = `
        SELECT COUNT(*) as log_count
        FROM logs 
        WHERE work_plan_id = ?
      `;
      
      const [logCountResult] = await pool.execute(hasLogsQuery, [workPlanId]);
      const hasLogs = logCountResult[0].log_count > 0;
      
      console.log(`[DEBUG] Has logs for work plan ${workPlanId}: ${hasLogs}`);
      
      if (!hasLogs) {
        return { status: 'pending', message: 'รอดำเนินการ' };
      }
      
      // ตรวจสอบสถานะของแต่ละ process
      const processStatusQuery = `
        SELECT 
          l.process_number,
          l.status,
          l.timestamp,
          ps.process_description
        FROM logs l
        LEFT JOIN work_plans wp ON l.work_plan_id = wp.id
        LEFT JOIN process_steps ps ON wp.job_code = ps.job_code AND l.process_number = ps.process_number
        WHERE l.work_plan_id = ? AND l.id IN (
          SELECT MAX(id) FROM logs 
          WHERE work_plan_id = ? 
          GROUP BY process_number
        )
        ORDER BY l.process_number
      `;
      
      const [processRows] = await pool.execute(processStatusQuery, [workPlanId, workPlanId]);
      console.log(`[DEBUG] Process rows for work plan ${workPlanId}:`, processRows);
      
      // ตรวจสอบว่าทุก process มี status เป็น 'stop' หรือไม่
      const allProcessesStopped = processRows.length > 0 && processRows.every(row => row.status === 'stop');
      
      console.log(`[DEBUG] All processes stopped for work plan ${workPlanId}: ${allProcessesStopped}`);
      
      if (allProcessesStopped) {
        return { 
          status: 'completed', 
          message: 'เสร็จสิ้น',
          processes: processRows
        };
      } else {
        return { 
          status: 'in_progress', 
          message: 'กำลังดำเนินการ',
          processes: processRows
        };
      }
    } catch (error) {
      console.error(`[ERROR] Error in getWorkPlanStatus for work plan ${workPlanId}:`, error);
      throw new Error(`Error fetching work plan status: ${error.message}`);
    }
  }

  // Get work plan status for multiple work plans
  static async getWorkPlansStatus(workPlanIds) {
    try {
      if (!workPlanIds || workPlanIds.length === 0) {
        return {};
      }
      
      const statusMap = {};
      
      for (const workPlanId of workPlanIds) {
        try {
          const status = await this.getWorkPlanStatus(workPlanId);
          statusMap[workPlanId] = status;
        } catch (error) {
          console.error(`Error getting status for work plan ${workPlanId}:`, error);
          statusMap[workPlanId] = { status: 'error', message: 'เกิดข้อผิดพลาด' };
        }
      }
      
      return statusMap;
    } catch (error) {
      throw new Error(`Error fetching work plans status: ${error.message}`);
    }
  }
}

module.exports = Log; 