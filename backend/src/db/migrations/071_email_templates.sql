-- Migration: 071_email_templates
-- Description: Create email_templates table and seed default system templates

CREATE TABLE IF NOT EXISTS email_templates (
    id CHAR(36) PRIMARY KEY,
    code VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    subject VARCHAR(255) NOT NULL,
    body_html MEDIUMTEXT NOT NULL,
    placeholders_json JSON,
    is_system BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email_templates_category (category),
    INDEX idx_email_templates_active (is_active)
);

-- Note: Templates are also automatically initialized and seeded by EmailTemplateService on server boot
