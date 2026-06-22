-- Migration: 047_live_class_module
-- Adds course_type and start_date to the courses table to support Live Classes.

ALTER TABLE courses ADD COLUMN course_type ENUM('recorded', 'live') DEFAULT 'recorded';
ALTER TABLE courses ADD COLUMN start_date DATETIME DEFAULT NULL;
