const { pool } = require('../config/database');

class ProductionRoom {
  // ดึงรายการห้องผลิตทั้งหมด
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM production_rooms ORDER BY room_code ASC'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error fetching production rooms: ${error.message}`);
    }
  }

  // ดึงข้อมูลห้องผลิตตาม ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM production_rooms WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching production room by ID: ${error.message}`);
    }
  }

  // ดึงข้อมูลห้องผลิตตามรหัสห้อง
  static async findByCode(roomCode) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM production_rooms WHERE room_code = ?',
        [roomCode]
      );
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching production room by code: ${error.message}`);
    }
  }

  // ดึงรายการห้องผลิตตามประเภท
  static async findByType(roomType) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM production_rooms WHERE room_type = ? ORDER BY room_code ASC',
        [roomType]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error fetching production rooms by type: ${error.message}`);
    }
  }

  // ดึงรายการห้องผลิตตามสถานะ
  static async findByStatus(status) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM production_rooms WHERE status = ? ORDER BY room_code ASC',
        [status]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error fetching production rooms by status: ${error.message}`);
    }
  }

  // เพิ่มห้องผลิตใหม่
  static async create(roomData) {
    try {
      const { room_code, room_name, room_type, capacity, location, status, description } = roomData;
      
      const [result] = await pool.execute(
        'INSERT INTO production_rooms (room_code, room_name, room_type, capacity, location, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [room_code, room_name, room_type, capacity, location, status || 'active', description]
      );
      
      return { id: result.insertId, ...roomData };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('รหัสห้องผลิตนี้มีอยู่ในระบบแล้ว');
      }
      throw new Error(`Error creating production room: ${error.message}`);
    }
  }

  // แก้ไขข้อมูลห้องผลิต
  static async update(id, roomData) {
    try {
      const { room_code, room_name, room_type, capacity, location, status, description } = roomData;
      
      const [result] = await pool.execute(
        'UPDATE production_rooms SET room_code = ?, room_name = ?, room_type = ?, capacity = ?, location = ?, status = ?, description = ? WHERE id = ?',
        [room_code, room_name, room_type, capacity, location, status, description, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('ไม่พบห้องผลิตที่ต้องการแก้ไข');
      }
      
      return { id, ...roomData };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('รหัสห้องผลิตนี้มีอยู่ในระบบแล้ว');
      }
      throw new Error(`Error updating production room: ${error.message}`);
    }
  }

  // ลบห้องผลิต
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM production_rooms WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('ไม่พบห้องผลิตที่ต้องการลบ');
      }
      
      return { message: 'ลบห้องผลิตสำเร็จ' };
    } catch (error) {
      throw new Error(`Error deleting production room: ${error.message}`);
    }
  }

  // ตรวจสอบว่าห้องผลิตถูกใช้งานในงานผลิตหรือไม่
  static async isUsedInWorkPlans(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM work_plans WHERE production_room_id = ?',
        [id]
      );
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(`Error checking production room usage: ${error.message}`);
    }
  }

  // ดึงรายการห้องผลิตที่ใช้งานได้ (active status)
  static async getActiveRooms() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM production_rooms WHERE status = "active" ORDER BY room_code ASC'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error fetching active production rooms: ${error.message}`);
    }
  }

  // ดึงรายการห้องผลิตตามประเภทที่ใช้งานได้
  static async getActiveRoomsByType(roomType) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM production_rooms WHERE room_type = ? AND status = "active" ORDER BY room_code ASC',
        [roomType]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error fetching active production rooms by type: ${error.message}`);
    }
  }
}

module.exports = ProductionRoom; 