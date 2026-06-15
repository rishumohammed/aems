CREATE TABLE IF NOT EXISTS terms_privacy_acceptances (
    id CHAR(36) PRIMARY KEY,
    candidate_id CHAR(36) NOT NULL,
    accepted_terms_version VARCHAR(50) NOT NULL,
    accepted_privacy_version VARCHAR(50) NOT NULL,
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    FOREIGN KEY (candidate_id) REFERENCES public_exam_candidates(id) ON DELETE CASCADE
);

INSERT IGNORE INTO system_config (`key`, `value`, `group`, `description`) VALUES 
('terms_content', 'Default Terms & Conditions text. Please edit in admin dashboard.', 'exam', 'Terms and Conditions Content'),
('terms_version', '1.0', 'exam', 'Terms and Conditions Version'),
('privacy_content', 'Default Privacy Policy text. Please edit in admin dashboard.', 'exam', 'Privacy Policy Content'),
('privacy_version', '1.0', 'exam', 'Privacy Policy Version');
