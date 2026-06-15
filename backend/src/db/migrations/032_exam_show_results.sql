ALTER TABLE exams ADD COLUMN IF NOT EXISTS show_results BOOLEAN DEFAULT TRUE COMMENT 'Show exam result to student';
