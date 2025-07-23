const db = require('../config/database');

class ProductionStatus {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM production_statuses ORDER BY id');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM production_statuses WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(statusData) {
    const { name, description, color, is_active = 1 } = statusData;
    const [result] = await db.execute(
      'INSERT INTO production_statuses (name, description, color, is_active, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, description, color, is_active]
    );
    return { id: result.insertId, ...statusData };
  }

  static async update(id, statusData) {
    const { name, description, color, is_active } = statusData;
    const [result] = await db.execute(
      'UPDATE production_statuses SET name = ?, description = ?, color = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
      [name, description, color, is_active, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM production_statuses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findActive() {
    const [rows] = await db.execute('SELECT * FROM production_statuses WHERE is_active = 1 ORDER BY id');
    return rows;
  }
}

module.exports = ProductionStatus; 