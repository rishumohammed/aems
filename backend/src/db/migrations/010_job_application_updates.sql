-- AEMS Job Application Schema Update (010)
ALTER TABLE job_applications 
  ADD COLUMN IF NOT EXISTS dob DATE AFTER applicant_name,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(50) AFTER dob,
  ADD COLUMN IF NOT EXISTS city VARCHAR(255) AFTER gender,
  ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255) AFTER city;
