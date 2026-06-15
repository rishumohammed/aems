-- Migration: Add preferred_job_categories to student_profiles
-- Add a JSON column to store array of job category IDs

ALTER TABLE `student_profiles`
ADD COLUMN `preferred_job_categories` JSON DEFAULT NULL;
