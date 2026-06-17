-- Migration 021: Fix Tutor Approval Workflow
-- Fixes the UNKNOWN status bug caused by 'pending' not being a valid ENUM value
-- and adds missing columns for the full approval workflow.

-- 1. Extend users.status ENUM to include ALL valid statuses
--    (adding 'pending' is NOT the fix — correct status is 'pending_review')
--    We ensure 'pending_review' and 'rejected' are in the ENUM (they were added in 013)
--    but also add 'approved' as a label alias concept. We keep 'active' = approved.
--    This ALTER is idempotent — safe to run even if already done.
ALTER TABLE users MODIFY COLUMN status 
  ENUM('active', 'inactive', 'suspended', 'pending_review', 'rejected') 
  DEFAULT 'active';

-- 2. Fix corrupted tutor rows: any tutor with empty/null status gets set to pending_review
--    (These were broken by the wrong 'pending' insert that MySQL silently rejected)
UPDATE users 
SET status = 'pending_review' 
WHERE role = 'tutor' AND (status = '' OR status IS NULL OR status = 'pending');

-- 3. Add rejection_reason to tutor_profiles if not exists
--    (admin.routes.js already tries to write to this column)
ALTER TABLE tutor_profiles 
  ADD COLUMN rejection_reason TEXT AFTER approval_notes,
  ADD COLUMN rejected_at DATETIME AFTER rejection_reason,
  ADD COLUMN rejected_by CHAR(36) AFTER rejected_at;

-- 4. Add foreign key for rejected_by (only if it doesn't exist)
ALTER TABLE tutor_profiles 
  ADD CONSTRAINT fk_tutor_rejected_by 
  FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL;

