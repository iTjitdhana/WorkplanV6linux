const { pool } = require('../config/database');

class MenuCatalog {
  // Get all menu items
  static async getAll() {
    try {
      const query = `
        SELECT 
          id,
          menu_key,
          label,
          path,
          menu_group,
          sort_order,
          is_active,
          created_at,
          updated_at
        FROM menu_catalog
        WHERE is_active = true
        ORDER BY sort_order ASC, label ASC
      `;
      
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching menu catalog: ${error.message}`);
    }
  }

  // Get menu by key
  static async getByKey(menuKey) {
    try {
      const query = `
        SELECT 
          id,
          menu_key,
          label,
          path,
          menu_group,
          sort_order,
          is_active,
          created_at,
          updated_at
        FROM menu_catalog
        WHERE menu_key = ? AND is_active = true
      `;
      
      const [rows] = await pool.execute(query, [menuKey]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error fetching menu by key: ${error.message}`);
    }
  }

  // Get menu by ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          id,
          menu_key,
          label,
          path,
          menu_group,
          sort_order,
          is_active,
          created_at,
          updated_at
        FROM menu_catalog
        WHERE id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error fetching menu by ID: ${error.message}`);
    }
  }

  // Create new menu item
  static async create(menuData) {
    try {
      const { menu_key, label, path, menu_group = 'system', sort_order = 0, is_active = true } = menuData;
      
      const query = `
        INSERT INTO menu_catalog (menu_key, label, path, menu_group, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [menu_key, label, path, menu_group, sort_order, is_active]);
      
      return { id: result.insertId, ...menuData };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Menu key already exists');
      }
      throw new Error(`Error creating menu: ${error.message}`);
    }
  }

  // Update menu item
  static async update(id, menuData) {
    try {
      const { menu_key, label, path, menu_group, sort_order, is_active } = menuData;
      
      const query = `
        UPDATE menu_catalog 
        SET menu_key = ?, label = ?, path = ?, menu_group = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const [result] = await pool.execute(query, [menu_key, label, path, menu_group, sort_order, is_active, id]);
      
      return result.affectedRows > 0 ? { id, ...menuData } : null;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Menu key already exists');
      }
      throw new Error(`Error updating menu: ${error.message}`);
    }
  }

  // Delete menu item (soft delete)
  static async delete(id) {
    try {
      const query = `
        UPDATE menu_catalog 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting menu: ${error.message}`);
    }
  }

  // Get menus by group
  static async getByGroup(group) {
    try {
      const query = `
        SELECT 
          id,
          menu_key,
          label,
          path,
          menu_group,
          sort_order,
          is_active,
          created_at,
          updated_at
        FROM menu_catalog
        WHERE menu_group = ? AND is_active = true
        ORDER BY sort_order ASC, label ASC
      `;
      
      const [rows] = await pool.execute(query, [group]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching menus by group: ${error.message}`);
    }
  }
}

module.exports = MenuCatalog;
