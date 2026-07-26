-- Redefine group ENUM column to include 'lms'
ALTER TABLE system_config 
MODIFY COLUMN `group` ENUM('branding', 'contact', 'email', 'whatsapp', 'payments', 'certificates', 'exam', 'lms') NOT NULL;

-- Update the education_levels row group to 'lms'
UPDATE system_config SET `group` = 'lms' WHERE `key` = 'education_levels';
