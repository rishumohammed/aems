-- Add enable_certificate to exams table for LMS course exams
ALTER TABLE exams ADD COLUMN enable_certificate BOOLEAN DEFAULT TRUE COMMENT 'Whether passing this exam issues a certificate';
