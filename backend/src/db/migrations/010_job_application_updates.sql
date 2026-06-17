-- AEMS Job Application Schema Update (010)
ALTER TABLE job_applications 
  ADD COLUMN dob DATE AFTER applicant_name,
  ADD COLUMN gender VARCHAR(50) AFTER dob,
  ADD COLUMN city VARCHAR(255) AFTER gender,
  ADD COLUMN linkedin VARCHAR(255) AFTER city;
