ALTER TABLE exams ADD COLUMN IF NOT EXISTS proctoring_config TEXT DEFAULT NULL COMMENT 'JSON-based proctoring configuration settings';
