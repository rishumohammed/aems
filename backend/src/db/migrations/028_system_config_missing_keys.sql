-- Insert missing config keys for contact and certificates
INSERT IGNORE INTO system_config (`key`, `value`, `group`, `description`, `is_sensitive`) VALUES 
('contact_email', 'contact@aems.local', 'contact', 'General contact email', FALSE),
('contact_phone', '+1234567890', 'contact', 'General contact phone number', FALSE),
('contact_address', '123 AEMS Campus, Education City', 'contact', 'Institution physical address', FALSE),
('certificate_prefix', 'AEMS-CERT-', 'certificates', 'Prefix for certificate numbers', FALSE),
('certificate_signature_name', 'John Doe', 'certificates', 'Name of the signatory on certificates', FALSE),
('certificate_signature_title', 'Director', 'certificates', 'Title of the signatory on certificates', FALSE);
