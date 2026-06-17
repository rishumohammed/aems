-- AEMS Certificate Updates (008)
-- Adds missing columns to certificates and creates supporting tables for generation and verification.

-- 1. Update: certificates
ALTER TABLE certificates 
  ADD COLUMN pdf_path VARCHAR(255) AFTER cert_number,
  ADD COLUMN revoked_at DATETIME AFTER status;

-- 2. New: cert_template_config
CREATE TABLE IF NOT EXISTS cert_template_config (
    id INT PRIMARY KEY,
    institution_name VARCHAR(255) NOT NULL,
    brand_color VARCHAR(20) DEFAULT '#007AFF',
    signatory_name VARCHAR(255),
    signatory_title VARCHAR(255),
    logo_url VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default config
INSERT IGNORE INTO cert_template_config (id, institution_name, brand_color, signatory_name, signatory_title)
VALUES (1, 'AEMS Academy', '#007AFF', 'Director', 'Head of Education');

-- 3. New: cert_verification_logs
CREATE TABLE IF NOT EXISTS cert_verification_logs (
    id CHAR(36) PRIMARY KEY,
    cert_id CHAR(36) NOT NULL,
    ip_address VARCHAR(45),
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cert_id) REFERENCES certificates(id) ON DELETE CASCADE
);
