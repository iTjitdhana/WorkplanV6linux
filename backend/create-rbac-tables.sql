-- Create role_menu_permissions table
CREATE TABLE IF NOT EXISTS role_menu_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  menu_key VARCHAR(50) NOT NULL,
  can_view BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_role_menu (role_id, menu_key),
  FOREIGN KEY (role_id) REFERENCES role_configurations(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_key) REFERENCES menu_catalog(menu_key) ON DELETE CASCADE
);

-- Create role_menu_audits table
CREATE TABLE IF NOT EXISTS role_menu_audits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_user_id INT,
  role_id INT NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'grant', 'revoke', 'bulk_update'
  before_data JSON,
  after_data JSON,
  reason TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES role_configurations(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_role_menu_permissions_role_id ON role_menu_permissions(role_id);
CREATE INDEX idx_role_menu_permissions_menu_key ON role_menu_permissions(menu_key);
CREATE INDEX idx_role_menu_audits_role_id ON role_menu_audits(role_id);
CREATE INDEX idx_role_menu_audits_created_at ON role_menu_audits(created_at);
CREATE INDEX idx_role_menu_audits_action ON role_menu_audits(action);

-- Insert sample data for testing (optional)
-- This will be handled by the seed script
