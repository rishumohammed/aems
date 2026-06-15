-- AEMS Employer Module Migration (014)

CREATE TABLE IF NOT EXISTS employer_profiles (
    user_id CHAR(36) PRIMARY KEY,
    employer_role ENUM('employer', 'recruiter', 'hiring_manager', 'company_hr') DEFAULT 'employer',
    company_name VARCHAR(255) NOT NULL,
    company_size VARCHAR(100),
    industry VARCHAR(255),
    address TEXT,
    logo_url TEXT,
    about_company TEXT,
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    social_links_json JSON,
    hiring_locations_json JSON,
    benefits_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employer_notifications (
    id CHAR(36) PRIMARY KEY,
    employer_id CHAR(36) NOT NULL,
    type ENUM('new_application', 'interview_confirmation', 'message', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
);
