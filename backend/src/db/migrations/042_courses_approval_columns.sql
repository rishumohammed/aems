-- Migration 042: Add missing courses columns for approval workflow & extended metadata
-- These columns exist locally but were never formally migrated.
-- All statements use IF NOT EXISTS pattern via safe ALTER TABLE approach.

-- 1. short_description
ALTER TABLE courses ADD COLUMN IF NOT EXISTS short_description TEXT AFTER description;

-- 2. level (beginner / intermediate / advanced)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(50) AFTER short_description;

-- 3. language
ALTER TABLE courses ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English' AFTER level;

-- 4. intro video (for course landing page preview)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS intro_video_source ENUM('youtube', 'vimeo') AFTER language;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS intro_video_id VARCHAR(255) AFTER intro_video_source;

-- 5. Approval workflow columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS approval_required BOOLEAN DEFAULT FALSE AFTER status;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS approved_by CHAR(36) AFTER approval_required;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS published_at DATETIME AFTER approved_by;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS rejection_reason TEXT AFTER published_at;

-- 6. Add FK for approved_by
ALTER TABLE courses ADD CONSTRAINT IF NOT EXISTS fk_courses_approved_by
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
