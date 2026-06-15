-- AEMS Interview Multiple Rounds Support (024)

-- 1. Add `round_name` column to `job_interviews` table
ALTER TABLE job_interviews 
ADD COLUMN round_name VARCHAR(255) DEFAULT 'Initial Interview' AFTER application_id;
