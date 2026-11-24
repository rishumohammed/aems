-- Add education, demographic, and address fields to leads table
-- to align with student registration and conversion requirements

ALTER TABLE leads
  ADD COLUMN education_level VARCHAR(100) DEFAULT NULL AFTER course_interest_ids,
  ADD COLUMN college_name VARCHAR(255) DEFAULT NULL AFTER education_level,
  ADD COLUMN gender VARCHAR(20) DEFAULT NULL AFTER college_name,
  ADD COLUMN date_of_birth DATE DEFAULT NULL AFTER gender,
  ADD COLUMN address TEXT DEFAULT NULL AFTER date_of_birth;

