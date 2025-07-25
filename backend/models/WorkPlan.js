const { pool } = require('../config/database');

class WorkPlan {
  // Get all work plans with operators
  static async getAll(date = null) {
    try {
      let query = `
        SELECT 
          wp.id,
          DATE_FORMAT(wp.production_date, '%Y-%m-%d') as production_date,
          wp.job_code,
          wp.job_name,
          wp.start_time,
          wp.end_time,
          COALESCE(wp.status_id, 1) as status_id,
          COALESCE(ps.name, 'รอดำเนินการ') as status_name,
          COALESCE(ps.color, '#FF6B6B') as status_color,
          ff.is_finished,
          ff.updated_at as finished_at,
          GROUP_CONCAT(DISTINCT u.name ORDER BY u.name) as operators,
          GROUP_CONCAT(DISTINCT wpo.id_code ORDER BY wpo.id_code) as operator_codes
        FROM work_plans wp
        LEFT JOIN production_statuses ps ON wp.status_id = ps.id
        LEFT JOIN finished_flags ff ON wp.id = ff.work_plan_id
        LEFT JOIN work_plan_operators wpo ON wp.id = wpo.work_plan_id
        LEFT JOIN users u ON wpo.user_id = u.id OR wpo.id_code = u.id_code
      `;
      
      const params = [];
      if (date) {
        // แก้ไขการเปรียบเทียบวันที่ให้ถูกต้อง
        query += ' WHERE DATE(wp.production_date) = ?';
        params.push(date);
        console.log('🔍 Query date:', date);
        console.log('🔍 SQL Query:', query);
        console.log('🔍 Params:', params);
      }
      
      query += ` GROUP BY wp.id 
                 ORDER BY wp.start_time ASC, 
                 CASE 
                   WHEN GROUP_CONCAT(DISTINCT u.name ORDER BY u.name) LIKE 'อ%' THEN 0 
                   ELSE 1 
                 END ASC,
                 GROUP_CONCAT(DISTINCT u.name ORDER BY u.name) ASC`;
      
      const [rows] = await pool.execute(query, params);
      console.log('📊 Raw database results:', rows.length, 'rows');
      return rows;
    } catch (error) {
      // Fallback query if status_id column doesn't exist
      console.log('⚠️ Status column not found, using fallback query');
      let fallbackQuery = `
        SELECT 
          wp.id,
          DATE_FORMAT(wp.production_date, '%Y-%m-%d') as production_date,
          wp.job_code,
          wp.job_name,
          wp.start_time,
          wp.end_time,
          1 as status_id,
          'รอดำเนินการ' as status_name,
          '#FF6B6B' as status_color,
          ff.is_finished,
          ff.updated_at as finished_at,
          GROUP_CONCAT(DISTINCT u.name ORDER BY u.name) as operators,
          GROUP_CONCAT(DISTINCT wpo.id_code ORDER BY wpo.id_code) as operator_codes
        FROM work_plans wp
        LEFT JOIN finished_flags ff ON wp.id = ff.work_plan_id
        LEFT JOIN work_plan_operators wpo ON wp.id = wpo.work_plan_id
        LEFT JOIN users u ON wpo.user_id = u.id OR wpo.id_code = u.id_code
      `;
      
      const params = [];
      if (date) {
        fallbackQuery += ' WHERE DATE(wp.production_date) = ?';
        params.push(date);
      }
      
      fallbackQuery += ` GROUP BY wp.id 
                         ORDER BY wp.start_time ASC, 
                         CASE 
                           WHEN GROUP_CONCAT(DISTINCT u.name ORDER BY u.name) LIKE 'อ%' THEN 0 
                           ELSE 1 
                         END ASC,
                         GROUP_CONCAT(DISTINCT u.name ORDER BY u.name) ASC`;
      
      const [rows] = await pool.execute(fallbackQuery, params);
      console.log('📊 Fallback query results:', rows.length, 'rows');
      return rows;
    }
  }

  // Get work plan by ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          wp.id,
          DATE_FORMAT(wp.production_date, '%Y-%m-%d') as production_date,
          wp.job_code,
          wp.job_name,
          wp.start_time,
          wp.end_time,
          ff.is_finished,
          ff.updated_at as finished_at
        FROM work_plans wp
        LEFT JOIN finished_flags ff ON wp.id = ff.work_plan_id
        WHERE wp.id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const workPlan = rows[0];
      
      // Get operators
      const operatorQuery = `
        SELECT 
          wpo.id,
          wpo.user_id,
          wpo.id_code,
          u.name
        FROM work_plan_operators wpo
        LEFT JOIN users u ON wpo.user_id = u.id OR wpo.id_code = u.id_code
        WHERE wpo.work_plan_id = ?
      `;
      
      const [operators] = await pool.execute(operatorQuery, [id]);
      workPlan.operators = operators;
      
      return workPlan;
    } catch (error) {
      throw new Error(`Error fetching work plan: ${error.message}`);
    }
  }

  // Helper function to format time
  static formatTime(timeString) {
    if (!timeString) return timeString;
    
    // If already in HH:MM:SS format, return as is
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    // If in HH:MM format, add :00 seconds
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      return timeString + ':00';
    }
    
    // If single number (like 9), convert to 09:00:00
    if (/^\d{1,2}$/.test(timeString)) {
      const hour = timeString.padStart(2, '0');
      return `${hour}:00:00`;
    }
    
    return timeString;
  }

  // Create new work plan
  static async create(workPlanData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const { production_date, job_code, job_name, start_time, end_time, operators } = workPlanData;
      
      console.log('🗄️ Database insert - production_date:', production_date);
      console.log('🗄️ Database insert - production_date type:', typeof production_date);
      
      // แปลงวันที่ให้เป็นรูปแบบที่ถูกต้อง
      let formattedDate = production_date;
      if (production_date instanceof Date) {
        formattedDate = production_date.toISOString().split('T')[0];
      } else if (typeof production_date === 'string') {
        // ถ้าเป็น string ให้ตรวจสอบรูปแบบ
        if (production_date.includes('T')) {
          formattedDate = production_date.split('T')[0];
        }
      }
      console.log('🗄️ Formatted date for database:', formattedDate);
      
      // Format times
      const formattedStartTime = this.formatTime(start_time);
      const formattedEndTime = this.formatTime(end_time);
      
      console.log('🕐 Original start_time:', start_time, '-> Formatted:', formattedStartTime);
      console.log('🕐 Original end_time:', end_time, '-> Formatted:', formattedEndTime);
      
      // Insert work plan
      const insertQuery = `
        INSERT INTO work_plans (production_date, job_code, job_name, start_time, end_time)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute(insertQuery, [
        formattedDate, job_code, job_name, formattedStartTime, formattedEndTime
      ]);
      
      const workPlanId = result.insertId;
      
      // Insert operators if provided
      if (operators && operators.length > 0) {
        const operatorQuery = `
          INSERT INTO work_plan_operators (work_plan_id, user_id, id_code)
          VALUES (?, ?, ?)
        `;
        
        for (const operator of operators) {
          await connection.execute(operatorQuery, [
            workPlanId,
            operator.user_id || null,
            operator.id_code || null
          ]);
        }
      }
      
      await connection.commit();
      return { id: workPlanId, ...workPlanData };
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating work plan: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Update work plan
  static async update(id, workPlanData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const { production_date, job_code, job_name, start_time, end_time, operators } = workPlanData;
      
      // แปลงวันที่ให้เป็นรูปแบบที่ถูกต้อง
      let formattedDate = production_date;
      if (production_date instanceof Date) {
        formattedDate = production_date.toISOString().split('T')[0];
      } else if (typeof production_date === 'string') {
        if (production_date.includes('T')) {
          formattedDate = production_date.split('T')[0];
        }
      }
      
      // Format times
      const formattedStartTime = this.formatTime(start_time);
      const formattedEndTime = this.formatTime(end_time);
      
      // Update work plan
      const updateQuery = `
        UPDATE work_plans 
        SET production_date = ?, job_code = ?, job_name = ?, start_time = ?, end_time = ?
        WHERE id = ?
      `;
      
      await connection.execute(updateQuery, [
        formattedDate, job_code, job_name, formattedStartTime, formattedEndTime, id
      ]);
      
      // Update operators
      if (operators !== undefined) {
        // Delete existing operators
        await connection.execute('DELETE FROM work_plan_operators WHERE work_plan_id = ?', [id]);
        
        // Insert new operators
        if (operators.length > 0) {
          const operatorQuery = `
            INSERT INTO work_plan_operators (work_plan_id, user_id, id_code)
            VALUES (?, ?, ?)
          `;
          
          for (const operator of operators) {
            await connection.execute(operatorQuery, [
              id,
              operator.user_id || null,
              operator.id_code || null
            ]);
          }
        }
      }
      
      await connection.commit();
      return { id, ...workPlanData };
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error updating work plan: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Delete work plan
  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Delete related data first (foreign key constraints)
      await connection.execute('DELETE FROM finished_flags WHERE work_plan_id = ?', [id]);
      await connection.execute('DELETE FROM work_plan_operators WHERE work_plan_id = ?', [id]);
      
      // Delete the work plan
      const query = 'DELETE FROM work_plans WHERE id = ?';
      const [result] = await connection.execute(query, [id]);
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error deleting work plan: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Mark work plan as finished
  static async markAsFinished(id) {
    try {
      const query = `
        INSERT INTO finished_flags (work_plan_id, is_finished, updated_at)
        VALUES (?, 1, NOW())
        ON DUPLICATE KEY UPDATE is_finished = 1, updated_at = NOW()
      `;
      
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      throw new Error(`Error marking work plan as finished: ${error.message}`);
    }
  }

  // Mark work plan as unfinished
  static async markAsUnfinished(id) {
    try {
      const query = `
        INSERT INTO finished_flags (work_plan_id, is_finished, updated_at)
        VALUES (?, 0, NOW())
        ON DUPLICATE KEY UPDATE is_finished = 0, updated_at = NOW()
      `;
      
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      throw new Error(`Error marking work plan as unfinished: ${error.message}`);
    }
  }

  // Update work plan status
  static async updateStatus(id, statusId) {
    try {
      const query = 'UPDATE work_plans SET status_id = ? WHERE id = ?';
      const [result] = await pool.execute(query, [statusId, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating work plan status: ${error.message}`);
    }
  }

  // Get work plan by ID (alias for getById)
  static async findById(id) {
    return this.getById(id);
  }
}

// เพิ่ม model สำหรับ work_plan_drafts
class DraftWorkPlan {
  static async getAll() {
    const [rows] = await pool.execute('SELECT *, DATE_FORMAT(production_date, "%Y-%m-%d") as production_date FROM work_plan_drafts ORDER BY production_date DESC, id DESC');
    return rows;
  }
  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM work_plan_drafts WHERE id = ?', [id]);
    return rows[0] || null;
  }
  static async create(data) {
    const { production_date, job_code, job_name, start_time, end_time, machine_id, production_room_id, notes, workflow_status_id, operators } = data;
    const [result] = await pool.execute(
      'INSERT INTO work_plan_drafts (production_date, job_code, job_name, start_time, end_time, machine_id, production_room_id, notes, workflow_status_id, operators) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [production_date, job_code, job_name, start_time, end_time, machine_id, production_room_id, notes || '', workflow_status_id || 1, JSON.stringify(operators || [])]
    );
    return { id: result.insertId, ...data };
  }
  static async update(id, data) {
    const { production_date, job_code, job_name, start_time, end_time, machine_id, production_room_id, notes, workflow_status_id, operators } = data;
    await pool.execute(
      'UPDATE work_plan_drafts SET production_date=?, job_code=?, job_name=?, start_time=?, end_time=?, machine_id=?, production_room_id=?, notes=?, workflow_status_id=?, operators=? WHERE id=?',
      [production_date, job_code, job_name, start_time, end_time, machine_id, production_room_id, notes || '', workflow_status_id || 1, JSON.stringify(operators || []), id]
    );
    return { id, ...data };
  }
  static async delete(id) {
    await pool.execute('DELETE FROM work_plan_drafts WHERE id = ?', [id]);
    return true;
  }
  static async syncDraftsToPlans(targetDate = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      let query = 'SELECT * FROM work_plan_drafts WHERE workflow_status_id = 2';
      let params = [];
      
      // ถ้ามีการระบุวันที่ ให้ sync เฉพาะวันที่นั้น
      if (targetDate) {
        query += ' AND production_date = ?';
        params.push(targetDate);
      }
      
      query += ' ORDER BY production_date ASC, start_time ASC';
      
      console.log('🔄 Sync query:', query);
      console.log('🔄 Sync params:', params);
      
      // ดึง drafts ที่มีสถานะ "บันทึกเสร็จสิ้น" (workflow_status_id = 2)
      const [drafts] = await connection.execute(query, params);
      
      console.log('🔄 Found drafts to sync:', drafts.length);
      drafts.forEach((draft, index) => {
        console.log(`🔄 Draft ${index + 1}:`, {
          id: draft.id,
          job_name: draft.job_name,
          production_date: draft.production_date,
          workflow_status_id: draft.workflow_status_id
        });
      });
      
      let syncedCount = 0;
      const syncedDrafts = [];
      
      // 1. บันทึก log การ sync
      let syncLogId = null;
      if (targetDate) {
        const [syncLogResult] = await connection.execute(
          'INSERT INTO workplan_sync_log (production_date) VALUES (?)',
          [targetDate]
        );
        syncLogId = syncLogResult.insertId;
      }
      // 2. ดึงเวลาซิงค์ล่าสุดของวันนั้น
      let lastSyncTime = null;
      if (targetDate) {
        const [syncRows] = await connection.execute(
          'SELECT synced_at FROM workplan_sync_log WHERE production_date = ? ORDER BY synced_at DESC LIMIT 1',
          [targetDate]
        );
        if (syncRows.length > 0) {
          lastSyncTime = new Date(syncRows[0].synced_at);
        }
      }
      
      for (const draft of drafts) {
        try {
          // แปลง operators จาก JSON string เป็น array (robust)
          let operators = [];
          try {
            if (typeof draft.operators === 'string' && (draft.operators.trim().startsWith('[') || draft.operators.trim().startsWith('{'))) {
              operators = JSON.parse(draft.operators);
            } else if (Array.isArray(draft.operators)) {
              operators = draft.operators;
            } else {
              operators = [];
            }
          } catch (e) {
            operators = [];
          }
          
          // ตรวจสอบว่ามีงานในวันนั้นอยู่แล้วหรือไม่ (เฉพาะที่ไม่ใช่ A, B, C, D)
          const defaultCodes = ['A', 'B', 'C', 'D'];
          const isDefaultJob = defaultCodes.includes(draft.job_code);
          // เช็คว่ามี A, B, C, D ใน workplans จริงของวันนั้นหรือยัง
          const [existingDefault] = await connection.execute(
            'SELECT COUNT(*) as count FROM work_plans WHERE production_date = ? AND job_code = ?',
            [draft.production_date, draft.job_code]
          );
          const [existingPlans] = await connection.execute(
            'SELECT COUNT(*) as count FROM work_plans WHERE production_date = ? AND job_code NOT IN (\'A\', \'B\', \'C\', \'D\')',
            [draft.production_date]
          );
          const isSpecialJob = existingPlans[0].count > 0 && !isDefaultJob;
          // 3. เช็คว่า draft นี้ถูกสร้างหลัง sync หรือไม่ (is_special)
          let isSpecialDraft = false;
          if (lastSyncTime && draft.created_at) {
            const draftCreatedAt = new Date(draft.created_at);
            isSpecialDraft = draftCreatedAt > lastSyncTime;
          }
          // 4. ไม่เติม prefix งานพิเศษใน job_code/job_name
          let jobCode = draft.job_code;
          let jobName = draft.job_name;
          // log debug
          console.log(`[SYNC] draft: ${draft.job_code} ${draft.job_name}, isSpecialDraft: ${isSpecialDraft}`);
          // สร้าง work plan ใหม่
          let insertQuery, insertParams;
          // ตรวจสอบว่ามี status_id และ is_special column หรือไม่
          const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'work_plans' 
            AND COLUMN_NAME IN ('status_id', 'is_special')
          `);
          const hasStatusColumn = columns.some(col => col.COLUMN_NAME === 'status_id');
          const hasIsSpecialColumn = columns.some(col => col.COLUMN_NAME === 'is_special');
          console.log('🔄 Has status_id column:', hasStatusColumn, 'Has is_special column:', hasIsSpecialColumn);
          if (hasStatusColumn && hasIsSpecialColumn) {
            insertQuery = 'INSERT INTO work_plans (production_date, job_code, job_name, start_time, end_time, status_id, is_special) VALUES (?, ?, ?, ?, ?, ?, ?)';
            insertParams = [
              draft.production_date, 
              jobCode, 
              jobName, 
              draft.start_time, 
              draft.end_time,
              isSpecialDraft ? 10 : 1, // 10 = งานพิเศษ, 1 = รอดำเนินการ
              isSpecialDraft ? 1 : 0   // is_special
            ];
          } else if (hasStatusColumn) {
            insertQuery = 'INSERT INTO work_plans (production_date, job_code, job_name, start_time, end_time, status_id) VALUES (?, ?, ?, ?, ?, ?)';
            insertParams = [
              draft.production_date, 
              jobCode, 
              jobName, 
              draft.start_time, 
              draft.end_time,
              isSpecialDraft ? 10 : 1 // 10 = งานพิเศษ, 1 = รอดำเนินการ
            ];
          } else {
            insertQuery = 'INSERT INTO work_plans (production_date, job_code, job_name, start_time, end_time) VALUES (?, ?, ?, ?, ?)';
            insertParams = [
              draft.production_date, 
              jobCode, 
              jobName, 
              draft.start_time, 
              draft.end_time
            ];
          }
          console.log('🔄 Insert query:', insertQuery);
          console.log('🔄 Insert params:', insertParams);
          const [result] = await connection.execute(insertQuery, insertParams);
          const workPlanId = result.insertId;
          // เพิ่ม operators
          for (const operator of operators) {
            await connection.execute(
              'INSERT INTO work_plan_operators (work_plan_id, user_id, id_code) VALUES (?, ?, ?)',
              [workPlanId, operator.user_id || null, operator.id_code || null]
            );
          }
          // ลบ draft หลังจาก sync สำเร็จ
          console.log('🔄 Deleting draft ID:', draft.id);
          await connection.execute('DELETE FROM work_plan_drafts WHERE id = ?', [draft.id]);
          syncedCount++;
          syncedDrafts.push({ draftId: draft.id, workPlanId });
          console.log('🔄 Successfully synced draft:', {
            draft_id: draft.id,
            work_plan_id: workPlanId,
            job_name: jobName
          });
          
        } catch (err) {
          console.error(`Error syncing draft ${draft.id}:`, err);
          // ไม่ rollback ทั้งหมด แต่ข้าม draft ที่มีปัญหา
          continue;
        }
      }
      
      console.log('🔄 Committing transaction...');
      await connection.commit();
      
      console.log('🔄 Sync completed. Total synced:', syncedCount);
      
      return {
        success: true,
        synced: syncedCount,
        drafts: syncedDrafts,
        message: `Sync สำเร็จ ${syncedCount} รายการ`
      };
      
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error syncing drafts to plans: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = { WorkPlan, DraftWorkPlan }; 