ALTER TABLE leads ADD COLUMN course_interest_ids JSON;

-- Update existing data
UPDATE leads 
SET course_interest_ids = JSON_ARRAY(course_interest_id) 
WHERE course_interest_id IS NOT NULL;
