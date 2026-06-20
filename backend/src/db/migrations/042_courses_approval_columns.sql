-- Migration 042: Add missing courses columns for approval workflow & extended metadata
-- These columns exist locally but were never formally migrated.
-- All statements use IF NOT EXISTS pattern via safe ALTER TABLE approach.



-- 5. Approval workflow columns
ALTER TABLE courses ADD COLUMN approval_required BOOLEAN DEFAULT FALSE AFTER status;
ALTER TABLE courses ADD COLUMN approved_by CHAR(36) AFTER approval_required;
ALTER TABLE courses ADD COLUMN published_at TIMESTAMP AFTER approved_by;

-- 6. Add FK for approved_by
ALTER TABLE courses ADD CONSTRAINT fk_courses_approved_by
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
