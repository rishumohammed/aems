CREATE TABLE IF NOT EXISTS expense_categories (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO expense_categories (id, name, slug) VALUES
  (UUID(), 'Operations', 'operations'),
  (UUID(), 'Marketing', 'marketing'),
  (UUID(), 'Infrastructure', 'infrastructure'),
  (UUID(), 'Salaries', 'salaries'),
  (UUID(), 'Tutor Payouts', 'tutor_payouts'),
  (UUID(), 'Miscellaneous', 'miscellaneous')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Alter expenses table to allow dynamic categories
ALTER TABLE expenses MODIFY COLUMN category VARCHAR(100) NOT NULL;
