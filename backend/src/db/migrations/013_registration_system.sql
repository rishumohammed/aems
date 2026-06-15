-- AEMS Registration System Migration

-- 1. Add 'pending_review' and 'rejected' to users status
ALTER TABLE users MODIFY COLUMN status ENUM('active', 'inactive', 'suspended', 'pending_review', 'rejected') DEFAULT 'active';

-- 2. Create Tutor Profiles table
CREATE TABLE IF NOT EXISTS tutor_profiles (
    user_id CHAR(36) PRIMARY KEY,
    qualification VARCHAR(255),
    specialization VARCHAR(255),
    teaching_experience TEXT,
    skills_expertise TEXT,
    resume_url TEXT,
    linkedin_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    approval_notes TEXT,
    approved_at DATETIME,
    approved_by CHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Ensure Student Profiles has missing fields
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS education_level VARCHAR(100) AFTER current_status,
ADD COLUMN IF NOT EXISTS interests TEXT AFTER skills,
ADD COLUMN IF NOT EXISTS resume_url TEXT AFTER interests;

-- 4. Create Auth Logs for security tracking
CREATE TABLE IF NOT EXISTS auth_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36),
    action VARCHAR(50) NOT NULL, -- 'login', 'register', 'password_change'
    ip_address VARCHAR(45),
    user_agent TEXT,
    status ENUM('success', 'failure') NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
