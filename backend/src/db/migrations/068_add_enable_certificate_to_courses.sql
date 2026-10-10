-- Add enable_certificate to courses table
ALTER TABLE courses ADD COLUMN enable_certificate BOOLEAN DEFAULT TRUE COMMENT 'Whether this course awards a completion certificate';
