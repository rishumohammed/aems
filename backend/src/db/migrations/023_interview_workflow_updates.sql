-- AEMS Interview Workflow Updates (023)

-- 1. Expand `job_interviews` table
ALTER TABLE job_interviews 
ADD COLUMN type ENUM('Online', 'Phone', 'In-Person') DEFAULT 'Online',
ADD COLUMN duration INT DEFAULT 60,
ADD COLUMN old_scheduled_at DATETIME NULL,
ADD COLUMN reschedule_reason TEXT NULL;

-- 2. Expand `job_interviews` status
ALTER TABLE job_interviews 
MODIFY COLUMN status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled', 'missed') DEFAULT 'scheduled';

-- 3. Expand `job_applications` status
ALTER TABLE job_applications 
MODIFY COLUMN status ENUM('applied', 'viewed', 'shortlisted', 'rejected', 'selected', 'hold', 'next_round') DEFAULT 'applied';
