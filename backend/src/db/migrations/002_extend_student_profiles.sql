ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS education_json JSON AFTER skills,
ADD COLUMN IF NOT EXISTS experience_json JSON AFTER education_json;
