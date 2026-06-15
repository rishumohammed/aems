-- Migration 017: Course Builder Modules & Lessons Enhancements

-- 1. Add description to course_sections (Chapters)
ALTER TABLE course_sections ADD COLUMN description TEXT DEFAULT NULL;

-- 2. Create course_modules table
CREATE TABLE IF NOT EXISTS course_modules (
    id CHAR(36) PRIMARY KEY,
    section_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE
);

-- 3. Add module_id to course_lessons and establish foreign key
ALTER TABLE course_lessons ADD COLUMN module_id CHAR(36) DEFAULT NULL AFTER section_id;
ALTER TABLE course_lessons ADD CONSTRAINT fk_lesson_module FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE;

-- 4. Migrate existing data: create a default module for each section and map lessons to it
-- We insert one module per section, using a generated UUID for each module
INSERT INTO course_modules (id, section_id, title, description, order_index)
SELECT UUID(), id, 'Module 1', 'General Module', 1
FROM course_sections;

-- 5. Map existing lessons to the newly created module of their section
UPDATE course_lessons l
JOIN course_modules m ON l.section_id = m.section_id
SET l.module_id = m.id
WHERE l.module_id IS NULL;
