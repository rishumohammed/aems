-- Migration: 050_curriculum_flattening.sql
-- Description: Flattens the 3-tier curriculum structure (Sections > Modules > Lessons) 
-- down to a 2-tier structure (Modules > Lessons) by dropping the intermediate `course_modules` table.
-- The old `course_sections` are now functionally referred to as "Modules" in the UI.

-- 1. Ensure all lessons map back directly to their section (if not already)
-- Note: 'section_id' has always existed on 'course_lessons', so we just make sure
-- any stray lessons linked only by 'module_id' are updated to the module's parent section.
UPDATE course_lessons cl
JOIN course_modules cm ON cl.module_id = cm.id
SET cl.section_id = cm.section_id
WHERE cl.section_id IS NULL AND cl.module_id IS NOT NULL;

-- 2. Drop the foreign key constraint that references course_modules
ALTER TABLE course_lessons DROP FOREIGN KEY fk_lesson_module;

-- 3. Drop the module_id column from course_lessons as it's no longer used
ALTER TABLE course_lessons DROP COLUMN module_id;

-- 4. Drop the course_modules table entirely
DROP TABLE IF EXISTS course_modules;
