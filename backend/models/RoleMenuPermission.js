const { pool } = require('../config/database');

class RoleMenuPermission {
  // Get all role menu permissions
  static async getAll() {
    try {
      const query = `
        SELECT 
          rmp.id,
          rmp.role_id,
          rmp.menu_key,
          rmp.can_view,
          rmp.created_at,
          rmp.updated_at,
          rc.role_name,
          rc.display_name,
          mc.label as menu_label
        FROM role_menu_permissions rmp
        JOIN role_configurations rc ON rmp.role_id = rc.id
        JOIN menu_catalog mc ON rmp.menu_key = mc.menu_key
        ORDER BY rc.display_name, mc.sort_order
      `;
      
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching role menu permissions: ${error.message}`);
    }
  }

  // Get permissions by role ID
  static async getByRoleId(roleId) {
    try {
      const query = `
        SELECT 
          rmp.id,
          rmp.role_id,
          rmp.menu_key,
          rmp.can_view,
          rmp.created_at,
          rmp.updated_at,
          mc.label as menu_label,
          mc.path,
          mc.menu_group,
          mc.sort_order
        FROM role_menu_permissions rmp
        JOIN menu_catalog mc ON rmp.menu_key = mc.menu_key
        WHERE rmp.role_id = ? AND mc.is_active = true
        ORDER BY mc.sort_order ASC, mc.label ASC
      `;
      
      const [rows] = await pool.execute(query, [roleId]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching permissions by role ID: ${error.message}`);
    }
  }

  // Get menu keys that a role can access
  static async getMenuKeysByRoleId(roleId) {
    try {
      const query = `
        SELECT menu_key
        FROM role_menu_permissions rmp
        JOIN menu_catalog mc ON rmp.menu_key = mc.menu_key
        WHERE rmp.role_id = ? AND rmp.can_view = true AND mc.is_active = true
        ORDER BY mc.sort_order ASC
      `;
      
      const [rows] = await pool.execute(query, [roleId]);
      return rows.map(row => row.menu_key);
    } catch (error) {
      throw new Error(`Error fetching menu keys by role ID: ${error.message}`);
    }
  }

  // Get permissions by menu key
  static async getByMenuKey(menuKey) {
    try {
      const query = `
        SELECT 
          rmp.id,
          rmp.role_id,
          rmp.menu_key,
          rmp.can_view,
          rmp.created_at,
          rmp.updated_at,
          rc.role_name,
          rc.display_name
        FROM role_menu_permissions rmp
        JOIN role_configurations rc ON rmp.role_id = rc.id
        WHERE rmp.menu_key = ?
        ORDER BY rc.display_name
      `;
      
      const [rows] = await pool.execute(query, [menuKey]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching permissions by menu key: ${error.message}`);
    }
  }

  // Create or update role menu permission
  static async upsert(roleId, menuKey, canView = true) {
    try {
      const query = `
        INSERT INTO role_menu_permissions (role_id, menu_key, can_view)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        can_view = VALUES(can_view),
        updated_at = CURRENT_TIMESTAMP
      `;
      
      const [result] = await pool.execute(query, [roleId, menuKey, canView]);
      return result.insertId || result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error upserting role menu permission: ${error.message}`);
    }
  }

  // Update role menu permissions in bulk
  static async updateRolePermissions(roleId, menuPermissions) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete existing permissions for this role
      const deleteQuery = `DELETE FROM role_menu_permissions WHERE role_id = ?`;
      await connection.execute(deleteQuery, [roleId]);

      // Insert new permissions
      if (menuPermissions && menuPermissions.length > 0) {
        const insertQuery = `
          INSERT INTO role_menu_permissions (role_id, menu_key, can_view)
          VALUES (?, ?, ?)
        `;
        
        for (const permission of menuPermissions) {
          await connection.execute(insertQuery, [
            roleId, 
            permission.menu_key, 
            permission.can_view || true
          ]);
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error updating role permissions: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Delete role menu permission
  static async delete(roleId, menuKey) {
    try {
      const query = `
        DELETE FROM role_menu_permissions 
        WHERE role_id = ? AND menu_key = ?
      `;
      
      const [result] = await pool.execute(query, [roleId, menuKey]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting role menu permission: ${error.message}`);
    }
  }

  // Delete all permissions for a role
  static async deleteByRoleId(roleId) {
    try {
      const query = `DELETE FROM role_menu_permissions WHERE role_id = ?`;
      const [result] = await pool.execute(query, [roleId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting permissions by role ID: ${error.message}`);
    }
  }

  // Check if role has permission for specific menu
  static async hasPermission(roleId, menuKey) {
    try {
      const query = `
        SELECT can_view
        FROM role_menu_permissions rmp
        JOIN menu_catalog mc ON rmp.menu_key = mc.menu_key
        WHERE rmp.role_id = ? AND rmp.menu_key = ? AND mc.is_active = true
      `;
      
      const [rows] = await pool.execute(query, [roleId, menuKey]);
      return rows.length > 0 && rows[0].can_view === 1;
    } catch (error) {
      throw new Error(`Error checking permission: ${error.message}`);
    }
  }

  // Get all roles with their menu permissions summary
  static async getRolesWithPermissions() {
    try {
      const query = `
        SELECT 
          rc.id,
          rc.role_name,
          rc.display_name,
          rc.color,
          rc.url_prefix,
          COUNT(rmp.menu_key) as total_permissions,
          SUM(CASE WHEN rmp.can_view = 1 THEN 1 ELSE 0 END) as allowed_permissions
        FROM role_configurations rc
        LEFT JOIN role_menu_permissions rmp ON rc.id = rmp.role_id
        GROUP BY rc.id, rc.role_name, rc.display_name, rc.color, rc.url_prefix
        ORDER BY rc.display_name
      `;
      
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching roles with permissions: ${error.message}`);
    }
  }
}

module.exports = RoleMenuPermission;
