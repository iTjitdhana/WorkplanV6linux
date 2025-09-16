const RoleMenuPermission = require('../models/RoleMenuPermission');

// Middleware to check if user has permission for a specific menu
const requireMenuPermission = (menuKey) => {
  return async (req, res, next) => {
    try {
      // Get user's role ID from request (you may need to adjust this based on your auth system)
      const userRoleId = req.user?.role_id;
      
      if (!userRoleId) {
        return res.status(403).json({
          success: false,
          message: 'ไม่พบบทบาทของผู้ใช้'
        });
      }
      
      // Check if user has permission for the menu
      const hasPermission = await RoleMenuPermission.hasPermission(userRoleId, menuKey);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'ไม่มีสิทธิ์เข้าถึงเมนูนี้'
        });
      }
      
      next();
    } catch (error) {
      console.error('Error checking menu permission:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
      });
    }
  };
};

// Middleware to check if user has any of the specified menu permissions
const requireAnyMenuPermission = (menuKeys) => {
  return async (req, res, next) => {
    try {
      const userRoleId = req.user?.role_id;
      
      if (!userRoleId) {
        return res.status(403).json({
          success: false,
          message: 'ไม่พบบทบาทของผู้ใช้'
        });
      }
      
      // Check if user has permission for any of the specified menus
      for (const menuKey of menuKeys) {
        const hasPermission = await RoleMenuPermission.hasPermission(userRoleId, menuKey);
        if (hasPermission) {
          return next();
        }
      }
      
      return res.status(403).json({
        success: false,
        message: 'ไม่มีสิทธิ์เข้าถึงเมนูที่ต้องการ'
      });
    } catch (error) {
      console.error('Error checking menu permissions:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
      });
    }
  };
};

// Middleware to check if user has all of the specified menu permissions
const requireAllMenuPermissions = (menuKeys) => {
  return async (req, res, next) => {
    try {
      const userRoleId = req.user?.role_id;
      
      if (!userRoleId) {
        return res.status(403).json({
          success: false,
          message: 'ไม่พบบทบาทของผู้ใช้'
        });
      }
      
      // Check if user has permission for all specified menus
      for (const menuKey of menuKeys) {
        const hasPermission = await RoleMenuPermission.hasPermission(userRoleId, menuKey);
        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            message: `ไม่มีสิทธิ์เข้าถึงเมนู: ${menuKey}`
          });
        }
      }
      
      next();
    } catch (error) {
      console.error('Error checking menu permissions:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
      });
    }
  };
};

// Middleware to check if user has admin role (assuming admin role has ID 2 based on your DB)
const requireAdminRole = () => {
  return async (req, res, next) => {
    try {
      const userRoleId = req.user?.role_id;
      
      if (!userRoleId) {
        return res.status(403).json({
          success: false,
          message: 'ไม่พบบทบาทของผู้ใช้'
        });
      }
      
      // Check if user has admin role (ID 2 from your role_configurations table)
      if (userRoleId !== 2) {
        return res.status(403).json({
          success: false,
          message: 'ต้องมีสิทธิ์ผู้ดูแลระบบ'
        });
      }
      
      next();
    } catch (error) {
      console.error('Error checking admin role:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
      });
    }
  };
};

// Middleware to add user permissions to request object
const addUserPermissions = () => {
  return async (req, res, next) => {
    try {
      const userRoleId = req.user?.role_id;
      
      if (userRoleId) {
        const menuKeys = await RoleMenuPermission.getMenuKeysByRoleId(userRoleId);
        req.userPermissions = {
          role_id: userRoleId,
          menu_keys: menuKeys
        };
      } else {
        req.userPermissions = {
          role_id: null,
          menu_keys: []
        };
      }
      
      next();
    } catch (error) {
      console.error('Error adding user permissions:', error);
      req.userPermissions = {
        role_id: null,
        menu_keys: []
      };
      next();
    }
  };
};

module.exports = {
  requireMenuPermission,
  requireAnyMenuPermission,
  requireAllMenuPermissions,
  requireAdminRole,
  addUserPermissions
};
