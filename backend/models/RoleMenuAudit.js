const { pool } = require('../config/database');

class RoleMenuAudit {
  // Create audit log
  static async create(auditData) {
    try {
      const { 
        actor_user_id, 
        role_id, 
        action, 
        before_data, 
        after_data, 
        reason = '', 
        ip_address = '', 
        user_agent = '' 
      } = auditData;
      
      const query = `
        INSERT INTO role_menu_audits (
          actor_user_id, 
          role_id, 
          action, 
          before_data, 
          after_data, 
          reason, 
          ip_address, 
          user_agent
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        actor_user_id,
        role_id,
        action,
        JSON.stringify(before_data),
        JSON.stringify(after_data),
        reason,
        ip_address,
        user_agent
      ]);
      
      return { id: result.insertId, ...auditData };
    } catch (error) {
      throw new Error(`Error creating audit log: ${error.message}`);
    }
  }

  // Get audit logs by role ID
  static async getByRoleId(roleId, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT 
          rma.id,
          rma.actor_user_id,
          rma.role_id,
          rma.action,
          rma.before_data,
          rma.after_data,
          rma.reason,
          rma.ip_address,
          rma.user_agent,
          rma.created_at,
          rc.display_name as role_name,
          u.name as actor_name
        FROM role_menu_audits rma
        LEFT JOIN role_configurations rc ON rma.role_id = rc.id
        LEFT JOIN users u ON rma.actor_user_id = u.id
        WHERE rma.role_id = ?
        ORDER BY rma.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [rows] = await pool.execute(query, [roleId, limit, offset]);
      return rows.map(row => ({
        ...row,
        before_data: row.before_data ? JSON.parse(row.before_data) : null,
        after_data: row.after_data ? JSON.parse(row.after_data) : null
      }));
    } catch (error) {
      throw new Error(`Error fetching audit logs by role ID: ${error.message}`);
    }
  }

  // Get all audit logs
  static async getAll(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT 
          rma.id,
          rma.actor_user_id,
          rma.role_id,
          rma.action,
          rma.before_data,
          rma.after_data,
          rma.reason,
          rma.ip_address,
          rma.user_agent,
          rma.created_at,
          rc.display_name as role_name,
          u.name as actor_name
        FROM role_menu_audits rma
        LEFT JOIN role_configurations rc ON rma.role_id = rc.id
        LEFT JOIN users u ON rma.actor_user_id = u.id
        ORDER BY rma.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [rows] = await pool.execute(query, [limit, offset]);
      return rows.map(row => ({
        ...row,
        before_data: row.before_data ? JSON.parse(row.before_data) : null,
        after_data: row.after_data ? JSON.parse(row.after_data) : null
      }));
    } catch (error) {
      throw new Error(`Error fetching all audit logs: ${error.message}`);
    }
  }

  // Get audit logs by action type
  static async getByAction(action, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT 
          rma.id,
          rma.actor_user_id,
          rma.role_id,
          rma.action,
          rma.before_data,
          rma.after_data,
          rma.reason,
          rma.ip_address,
          rma.user_agent,
          rma.created_at,
          rc.display_name as role_name,
          u.name as actor_name
        FROM role_menu_audits rma
        LEFT JOIN role_configurations rc ON rma.role_id = rc.id
        LEFT JOIN users u ON rma.actor_user_id = u.id
        WHERE rma.action = ?
        ORDER BY rma.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [rows] = await pool.execute(query, [action, limit, offset]);
      return rows.map(row => ({
        ...row,
        before_data: row.before_data ? JSON.parse(row.before_data) : null,
        after_data: row.after_data ? JSON.parse(row.after_data) : null
      }));
    } catch (error) {
      throw new Error(`Error fetching audit logs by action: ${error.message}`);
    }
  }

  // Get audit logs by date range
  static async getByDateRange(startDate, endDate, limit = 50, offset = 0) {
    try {
      const query = `
        SELECT 
          rma.id,
          rma.actor_user_id,
          rma.role_id,
          rma.action,
          rma.before_data,
          rma.after_data,
          rma.reason,
          rma.ip_address,
          rma.user_agent,
          rma.created_at,
          rc.display_name as role_name,
          u.name as actor_name
        FROM role_menu_audits rma
        LEFT JOIN role_configurations rc ON rma.role_id = rc.id
        LEFT JOIN users u ON rma.actor_user_id = u.id
        WHERE DATE(rma.created_at) BETWEEN ? AND ?
        ORDER BY rma.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [rows] = await pool.execute(query, [startDate, endDate, limit, offset]);
      return rows.map(row => ({
        ...row,
        before_data: row.before_data ? JSON.parse(row.before_data) : null,
        after_data: row.after_data ? JSON.parse(row.after_data) : null
      }));
    } catch (error) {
      throw new Error(`Error fetching audit logs by date range: ${error.message}`);
    }
  }

  // Get audit log by ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          rma.id,
          rma.actor_user_id,
          rma.role_id,
          rma.action,
          rma.before_data,
          rma.after_data,
          rma.reason,
          rma.ip_address,
          rma.user_agent,
          rma.created_at,
          rc.display_name as role_name,
          u.name as actor_name
        FROM role_menu_audits rma
        LEFT JOIN role_configurations rc ON rma.role_id = rc.id
        LEFT JOIN users u ON rma.actor_user_id = u.id
        WHERE rma.id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        ...row,
        before_data: row.before_data ? JSON.parse(row.before_data) : null,
        after_data: row.after_data ? JSON.parse(row.after_data) : null
      };
    } catch (error) {
      throw new Error(`Error fetching audit log by ID: ${error.message}`);
    }
  }

  // Get audit summary statistics
  static async getAuditSummary() {
    try {
      const query = `
        SELECT 
          action,
          COUNT(*) as count,
          DATE(created_at) as date
        FROM role_menu_audits
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY action, DATE(created_at)
        ORDER BY date DESC, count DESC
      `;
      
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching audit summary: ${error.message}`);
    }
  }

  // Clean old audit logs (older than specified days)
  static async cleanOldLogs(daysOld = 365) {
    try {
      const query = `
        DELETE FROM role_menu_audits 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `;
      
      const [result] = await pool.execute(query, [daysOld]);
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Error cleaning old audit logs: ${error.message}`);
    }
  }
}

module.exports = RoleMenuAudit;
