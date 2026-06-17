ALTER TABLE exams ADD COLUMN proctoring_config TEXT DEFAULT NULL COMMENT 'JSON-based proctoring configuration settings';
