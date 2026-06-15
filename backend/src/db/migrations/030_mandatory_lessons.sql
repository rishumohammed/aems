-- Add is_mandatory flag to course_lessons for exam-based lessons
ALTER TABLE course_lessons
ADD COLUMN is_mandatory BOOLEAN DEFAULT TRUE;
