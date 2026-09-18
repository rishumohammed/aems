-- Add college_name column to student_profiles
ALTER TABLE student_profiles ADD COLUMN college_name VARCHAR(255) DEFAULT NULL AFTER education_level;
