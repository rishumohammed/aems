CREATE TABLE IF NOT EXISTS master_standards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sub VARCHAR(100) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO master_standards (name, sub, icon, color, sort_order) VALUES
  ('ISO', 'Quality Mgmt', 'mdi-certificate-outline', 'primary', 1),
  ('FSSC', 'Food Safety', 'mdi-food-apple-outline', 'teal', 2),
  ('BRCGS', 'Global Std', 'mdi-shield-check-outline', 'orange', 3),
  ('OHSMS', 'Safety Mgmt', 'mdi-hard-hat', 'deep-purple', 4),
  ('QMS', 'Quality Sys', 'mdi-check-circle-outline', 'success', 5),
  ('HACCP', 'Hazard Control', 'mdi-flask-outline', 'red', 6)
ON DUPLICATE KEY UPDATE id=id;
