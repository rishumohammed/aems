-- AEMS Enrollment Constraints (011)
-- Prevents duplicate enrollments for the same student and course.

ALTER TABLE enrollments 
  ADD UNIQUE KEY unique_enrollment (student_id, course_id);
