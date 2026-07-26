-- Insert education levels configuration key into system_config
INSERT IGNORE INTO system_config (`key`, `value`, `group`, `description`, `is_sensitive`) 
VALUES ('education_levels', 'High School, Bachelor\'s, Master\'s, PhD, Self-Taught', 'lms', 'Configured options for student education level dropdown', 0);
