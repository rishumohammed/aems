-- Add new roles to the existing ENUM
-- MySQL does not support adding to an ENUM directly via ALTER TABLE ADD VALUE IF NOT EXISTS easily in all versions.
-- The safest way is to redefine the column with the new ENUM list.
ALTER TABLE users 
MODIFY COLUMN role ENUM(
    'super_admin', 
    'crm_agent', 
    'tutor', 
    'student', 
    'employer', 
    'visitor',
    'sub_admin',
    'placement_coordinator',
    'finance_staff',
    'exam_manager',
    'support_staff'
) NOT NULL;

-- Add permissions_json column to store fine-grained RBAC rules
ALTER TABLE users 
ADD COLUMN permissions_json JSON DEFAULT NULL;

-- Add force_password_change flag
ALTER TABLE users 
ADD COLUMN force_password_change BOOLEAN DEFAULT FALSE;

-- Add last_login_at timestamp
ALTER TABLE users 
ADD COLUMN last_login_at TIMESTAMP NULL DEFAULT NULL;

-- Create Audit Logs table for administrative actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    action VARCHAR(100) NOT NULL,
    target VARCHAR(100),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
