ALTER TABLE student_profiles 
ADD COLUMN education_json JSON AFTER skills,
ADD COLUMN experience_json JSON AFTER education_json;
