-- Lead Conversion Workflow Enhancements
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;

ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS student_id VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS converted_by CHAR(36) NULL,
ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50) NULL;

-- Add foreign key constraint for converted_by
ALTER TABLE student_profiles
ADD CONSTRAINT fk_student_profiles_converted_by 
FOREIGN KEY (converted_by) REFERENCES users(id) ON DELETE SET NULL;
