-- Migration 022: Employer Approval Workflow

ALTER TABLE employer_profiles 
ADD COLUMN approval_status ENUM('pending_approval', 'approved', 'rejected', 'suspended', 'inactive') DEFAULT 'pending_approval' AFTER employer_role,
ADD COLUMN approved_by CHAR(36) NULL AFTER approval_status,
ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by,
ADD COLUMN rejected_at TIMESTAMP NULL AFTER approved_at,
ADD COLUMN rejection_reason TEXT NULL AFTER rejected_at;

-- Set existing active employers to approved, pending to pending_approval
UPDATE employer_profiles ep
JOIN users u ON ep.user_id = u.id
SET ep.approval_status = 'approved'
WHERE u.status = 'active';

UPDATE employer_profiles ep
JOIN users u ON ep.user_id = u.id
SET ep.approval_status = 'pending_approval'
WHERE u.status = 'pending';

-- Foreign key for approved_by
ALTER TABLE employer_profiles
ADD CONSTRAINT fk_employers_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
