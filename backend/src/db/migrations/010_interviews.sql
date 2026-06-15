-- AEMS Interviews Migration (010)
CREATE TABLE IF NOT EXISTS job_interviews (
    id CHAR(36) PRIMARY KEY,
    application_id CHAR(36) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    location VARCHAR(255),
    meeting_link TEXT,
    status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE
);
