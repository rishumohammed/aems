-- Migration: Make course_id nullable in certificates and drop foreign key on exam_attempt_id
-- We drop the foreign key certificates_ibfk_3 to allow either course exam attempts or public exam attempts to be stored in exam_attempt_id.

ALTER TABLE certificates DROP FOREIGN KEY certificates_ibfk_3;
ALTER TABLE certificates MODIFY COLUMN course_id CHAR(36) NULL;
