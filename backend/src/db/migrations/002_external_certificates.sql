CREATE TABLE IF NOT EXISTS external_certificates (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    certificate_name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    credential_id VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    file_url TEXT,
    skills JSON,
    description TEXT,
    verification_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
