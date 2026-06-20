-- Migration 046: Production Schema Sync
-- Fixes type mismatches and missing ENUM values

-- 1. Sync users.role ENUM
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
    'support_staff',
    'lms_user'
) NOT NULL;

-- 2. Sync public_exams.status ENUM
ALTER TABLE public_exams 
MODIFY COLUMN status ENUM('draft', 'review', 'published', 'archived') DEFAULT 'draft';

-- 3. Sync leads.source to VARCHAR(50) instead of ENUM
ALTER TABLE leads 
MODIFY COLUMN source VARCHAR(50) DEFAULT 'manual';

-- 4. Standardize employer_profiles approval columns
ALTER TABLE employer_profiles DROP FOREIGN KEY fk_employers_approved_by;

ALTER TABLE employer_profiles 
MODIFY COLUMN approved_by CHAR(36) DEFAULT NULL,
MODIFY COLUMN approved_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE employer_profiles ADD CONSTRAINT fk_employers_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
