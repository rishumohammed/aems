-- Migration 015: Job Approval Workflow

-- 1. Alter the status ENUM to include 'draft', 'pending_approval', and 'closed'.
-- We need to change existing 'pending' to 'pending_approval' if necessary.
-- Since MySQL ENUM altering can be tricky with existing data if we remove values, 
-- we first add the new values, update the rows, and then we could remove 'pending',
-- but for safety we can just leave 'pending' in the ENUM or rename it effectively.

ALTER TABLE jobs MODIFY COLUMN status ENUM('draft', 'pending', 'pending_approval', 'approved', 'rejected', 'closed') DEFAULT 'draft';

-- Update any existing pending jobs
UPDATE jobs SET status = 'pending_approval' WHERE status = 'pending';

-- Alter again to remove 'pending'
ALTER TABLE jobs MODIFY COLUMN status ENUM('draft', 'pending_approval', 'approved', 'rejected', 'closed') DEFAULT 'draft';

-- 2. Add approval workflow columns
ALTER TABLE jobs 
ADD COLUMN approved_by CHAR(36) NULL AFTER status,
ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by,
ADD COLUMN rejection_reason TEXT NULL AFTER approved_at;

-- Foreign key for approved_by if desired (optional, but good for integrity)
ALTER TABLE jobs
ADD CONSTRAINT fk_jobs_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
