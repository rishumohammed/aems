-- Migration 012: Lesson Type Extensions
ALTER TABLE course_lessons MODIFY COLUMN type ENUM('video', 'live', 'text', 'resource', 'quiz', 'assignment') NOT NULL;
ALTER TABLE course_lessons ADD COLUMN quiz_id CHAR(36) AFTER zoom_link;
ALTER TABLE course_lessons ADD COLUMN assignment_id CHAR(36) AFTER quiz_id;
ALTER TABLE course_lessons ADD COLUMN content_html LONGTEXT AFTER assignment_id;

-- Add foreign keys
ALTER TABLE course_lessons ADD CONSTRAINT fk_lesson_quiz FOREIGN KEY (quiz_id) REFERENCES exams(id) ON DELETE SET NULL;
ALTER TABLE course_lessons ADD CONSTRAINT fk_lesson_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL;
