-- Migration: Job Portal Improvements (Additional Filters and Fields)

-- 1. Extend Jobs table with optional preferences/requirements
ALTER TABLE jobs 
ADD COLUMN gender_preference ENUM('any', 'male', 'female', 'other') DEFAULT 'any',
ADD COLUMN qualification_req VARCHAR(255) NULL,
ADD COLUMN language_req JSON NULL,
ADD COLUMN specialization_req VARCHAR(255) NULL,
ADD COLUMN joining_status_req VARCHAR(100) NULL;

-- 2. Extend Student Profiles with missing fields
ALTER TABLE student_profiles 
ADD COLUMN language_proficiency JSON NULL,
ADD COLUMN joining_status VARCHAR(100) NULL;

-- 3. Extend Job Applications to snapshot these fields at the time of application
ALTER TABLE job_applications 
ADD COLUMN applicant_gender VARCHAR(50) NULL,
ADD COLUMN language_proficiency JSON NULL,
ADD COLUMN joining_status VARCHAR(100) NULL;

-- 4. Retroactively backfill gender from student_profiles to existing job_applications
UPDATE job_applications ja
JOIN student_profiles sp ON ja.student_id = sp.user_id
SET ja.applicant_gender = sp.gender
WHERE ja.applicant_gender IS NULL;
