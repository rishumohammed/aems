-- System Config and Forms Update

CREATE TABLE IF NOT EXISTS system_config (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT,
    `group` ENUM('branding', 'contact', 'email', 'whatsapp', 'payments', 'certificates', 'exam') NOT NULL,
    `description` TEXT,
    `is_sensitive` BOOLEAN DEFAULT FALSE,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Branding Initial Config
INSERT IGNORE INTO system_config (`key`, `value`, `group`, `description`) VALUES 
('institute_name', 'AEMS Academy', 'branding', 'The name of the institution'),
('tagline', 'Empowering Minds, Shaping Futures', 'branding', 'Institution tagline'),
('brand_primary_color', '#007AFF', 'branding', 'Primary brand color'),
('brand_secondary_color', '#5856D6', 'branding', 'Secondary brand color');

-- Email Initial Config
INSERT IGNORE INTO system_config (`key`, `value`, `group`, `description`, `is_sensitive`) VALUES 
('smtp_host', 'smtp.mailtrap.io', 'email', 'SMTP server host', FALSE),
('smtp_port', '2525', 'email', 'SMTP server port', FALSE),
('smtp_user', '', 'email', 'SMTP username', FALSE),
('smtp_pass', '', 'email', 'SMTP password', TRUE),
('smtp_from_name', 'AEMS Academy', 'email', 'Sender name for emails', FALSE),
('smtp_from_email', 'noreply@aems.local', 'email', 'Sender email address', FALSE);

-- WhatsApp Initial Config
INSERT IGNORE INTO system_config (`key`, `value`, `group`, `description`, `is_sensitive`) VALUES 
('whatsapp_app_id', '', 'whatsapp', 'Meta App ID', FALSE),
('whatsapp_access_token', '', 'whatsapp', 'Meta Access Token', TRUE),
('whatsapp_phone_number_id', '', 'whatsapp', 'Meta Phone Number ID', FALSE),
('whatsapp_verify_token', 'aems_whatsapp_verify_123', 'whatsapp', 'Webhook Verify Token', FALSE);

-- Payments Initial Config
INSERT IGNORE INTO system_config (`key`, `value`, `group`, `description`, `is_sensitive`) VALUES 
('razorpay_key_id', '', 'payments', 'Razorpay Key ID', FALSE),
('razorpay_key_secret', '', 'payments', 'Razorpay Key Secret', TRUE),
('razorpay_webhook_secret', '', 'payments', 'Razorpay Webhook Secret', TRUE);

-- Lead Forms Update
ALTER TABLE lead_form_configs 
ADD COLUMN description TEXT AFTER form_name,
ADD COLUMN success_message TEXT AFTER fields_json,
ADD COLUMN embed_code TEXT AFTER success_message;
