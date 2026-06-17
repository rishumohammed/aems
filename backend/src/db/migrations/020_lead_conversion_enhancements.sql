-- Lead Conversion Workflow Enhancements
ALTER TABLE users 
ADD COLUMN force_password_change BOOLEAN DEFAULT FALSE;

ALTER TABLE student_profiles 
ADD COLUMN student_id VARCHAR(50) NULL,
ADD COLUMN converted_by CHAR(36) NULL,
ADD COLUMN lead_source VARCHAR(50) NULL;

-- Add foreign key constraint for converted_by
ALTER TABLE student_profiles
ADD CONSTRAINT fk_student_profiles_converted_by 
FOREIGN KEY (converted_by) REFERENCES users(id) ON DELETE SET NULL;
