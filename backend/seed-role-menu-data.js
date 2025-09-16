const { pool } = require('./config/database');

async function seedMenuCatalog() {
  try {
    console.log('🌱 Seeding menu catalog...');
    
    const menuItems = [
      { menu_key: 'home', label: 'หน้าหลัก', path: '/admin/home', menu_group: 'system', sort_order: 10 },
      { menu_key: 'logs', label: 'ระบบจัดการ Logs', path: '/admin/logs', menu_group: 'system', sort_order: 20 },
      { menu_key: 'production', label: 'ติดตามการผลิต', path: '/admin/production', menu_group: 'system', sort_order: 30 },
      { menu_key: 'reports', label: 'รายงาน', path: '/admin/reports', menu_group: 'system', sort_order: 40 },
      { menu_key: 'users', label: 'จัดการผู้ใช้', path: '/admin/users', menu_group: 'system', sort_order: 50 },
      { menu_key: 'settings', label: 'ตั้งค่าระบบ', path: '/admin/settings', menu_group: 'system', sort_order: 60 },
      { menu_key: 'status', label: 'ติดตามสถานะ', path: '/admin/status', menu_group: 'system', sort_order: 70 }
    ];

    for (const menu of menuItems) {
      const query = `
        INSERT INTO menu_catalog (menu_key, label, path, menu_group, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, true)
        ON DUPLICATE KEY UPDATE
        label = VALUES(label),
        path = VALUES(path),
        menu_group = VALUES(menu_group),
        sort_order = VALUES(sort_order),
        is_active = VALUES(is_active),
        updated_at = CURRENT_TIMESTAMP
      `;
      
      await pool.execute(query, [menu.menu_key, menu.label, menu.path, menu.menu_group, menu.sort_order]);
      console.log(`✅ Added/Updated menu: ${menu.label}`);
    }
    
    console.log('✅ Menu catalog seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding menu catalog:', error);
    throw error;
  }
}

async function seedRolePermissions() {
  try {
    console.log('🌱 Seeding role permissions...');
    
    // Define role permissions based on your existing roles
    const rolePermissions = [
      // Planner role (ID: 1) - Basic access
      { role_id: 1, menu_keys: ['home', 'logs', 'production'] },
      
      // Admin role (ID: 2) - Full access
      { role_id: 2, menu_keys: ['home', 'logs', 'production', 'reports', 'users', 'settings', 'status'] },
      
      // Viewer role (ID: 4) - Read-only access
      { role_id: 4, menu_keys: ['home', 'logs', 'reports'] },
      
      // Operation role (ID: 5) - Operational access
      { role_id: 5, menu_keys: ['home', 'logs', 'production', 'reports', 'status'] }
    ];

    for (const rolePerm of rolePermissions) {
      // Clear existing permissions for this role
      await pool.execute('DELETE FROM role_menu_permissions WHERE role_id = ?', [rolePerm.role_id]);
      
      // Add new permissions
      for (const menuKey of rolePerm.menu_keys) {
        const query = `
          INSERT INTO role_menu_permissions (role_id, menu_key, can_view)
          VALUES (?, ?, true)
        `;
        
        await pool.execute(query, [rolePerm.role_id, menuKey]);
      }
      
      console.log(`✅ Set permissions for role ID ${rolePerm.role_id}: ${rolePerm.menu_keys.join(', ')}`);
    }
    
    console.log('✅ Role permissions seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding role permissions:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting RBAC data seeding...');
    
    await seedMenuCatalog();
    await seedRolePermissions();
    
    console.log('🎉 RBAC data seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Menu catalog: 7 items');
    console.log('- Role permissions: 4 roles configured');
    console.log('\n🔗 API Endpoints:');
    console.log('- GET /api/admin/menu-catalog');
    console.log('- GET /api/admin/roles');
    console.log('- GET /api/admin/roles/:roleId/permissions');
    console.log('- PUT /api/admin/roles/:roleId/permissions');
    console.log('- GET /api/me/permissions');
    
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { seedMenuCatalog, seedRolePermissions };
