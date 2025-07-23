const { pool } = require('../config/database');

class Machine {
  // ดึงรายการเครื่องทั้งหมด
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM machines ORDER BY machine_code ASC'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error fetching machines: ${error.message}`);
    }
  }

  // ดึงข้อมูลเครื่องตาม ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM machines WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching machine by ID: ${error.message}`);
    }
  }

  // ดึงข้อมูลเครื่องตามรหัสเครื่อง
  static async findByCode(machineCode) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM machines WHERE machine_code = ?',
        [machineCode]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching machine by code: ${error.message}`);
    }
  }

  // ดึงรายการเครื่องตามสถานะ
  static async findByStatus(status) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM machines WHERE status = ? ORDER BY machine_code ASC',
        [status]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error fetching machines by status: ${error.message}`);
    }
  }

  // เพิ่มเครื่องใหม่
  static async create(machineData) {
    try {
      const { machine_code, machine_name, machine_type, location, status, description } = machineData;
      
      const [result] = await pool.execute(
        'INSERT INTO machines (machine_code, machine_name, machine_type, location, status, description) VALUES (?, ?, ?, ?, ?, ?)',
        [machine_code, machine_name, machine_type, location, status || 'active', description]
      );
      
      return { id: result.insertId, ...machineData };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('รหัสเครื่องนี้มีอยู่ในระบบแล้ว');
      }
      throw new Error(`Error creating machine: ${error.message}`);
    }
  }

  // แก้ไขข้อมูลเครื่อง
  static async update(id, machineData) {
    try {
      const { machine_code, machine_name, machine_type, location, status, description } = machineData;
      
      const [result] = await pool.execute(
        'UPDATE machines SET machine_code = ?, machine_name = ?, machine_type = ?, location = ?, status = ?, description = ? WHERE id = ?',
        [machine_code, machine_name, machine_type, location, status, description, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('ไม่พบเครื่องที่ต้องการแก้ไข');
      }
      
      return { id, ...machineData };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('รหัสเครื่องนี้มีอยู่ในระบบแล้ว');
      }
      throw new Error(`Error updating machine: ${error.message}`);
    }
  }

  // ลบเครื่อง
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM machines WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('ไม่พบเครื่องที่ต้องการลบ');
      }
      
      return { message: 'ลบเครื่องสำเร็จ' };
    } catch (error) {
      throw new Error(`Error deleting machine: ${error.message}`);
    }
  }

  // ตรวจสอบว่าเครื่องถูกใช้งานในงานผลิตหรือไม่
  static async isUsedInWorkPlans(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM work_plans WHERE machine_id = ?',
        [id]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(`Error checking machine usage: ${error.message}`);
    }
  }
}

module.exports = Machine; 