CREATE TABLE IF NOT EXISTS master_languages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_qualifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  level_rank INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS master_notice_periods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed initial languages
INSERT INTO master_languages (name, code, sort_order) VALUES
  ('English', 'en', 1),
  ('Arabic', 'ar', 2),
  ('Hindi', 'hi', 3),
  ('Malayalam', 'ml', 4),
  ('Tamil', 'ta', 5),
  ('Spanish', 'es', 6),
  ('French', 'fr', 7),
  ('German', 'de', 8),
  ('Mandarin', 'zh', 9),
  ('Urdu', 'ur', 10),
  ('Russian', 'ru', 11),
  ('Japanese', 'ja', 12),
  ('Portuguese', 'pt', 13),
  ('Italian', 'it', 14),
  ('Bengali', 'bn', 15)
ON DUPLICATE KEY UPDATE id=id;

-- Seed initial qualifications
INSERT INTO master_qualifications (name, level_rank, sort_order) VALUES
  ('10th', 0, 1),
  ('High School', 1, 2),
  ('Diploma', 2, 3),
  ('Bachelors', 3, 4),
  ('Masters', 4, 5),
  ('PhD', 5, 6)
ON DUPLICATE KEY UPDATE id=id;

-- Seed initial notice periods
INSERT INTO master_notice_periods (name, sort_order) VALUES
  ('Immediate', 1),
  ('15 Days', 2),
  ('30 Days', 3),
  ('60 Days', 4),
  ('90 Days', 5)
ON DUPLICATE KEY UPDATE id=id;
