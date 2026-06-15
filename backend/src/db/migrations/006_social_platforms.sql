-- Migration: Dynamic Social Platforms
-- Description: Creates a table to manage dynamic social platforms for the student dashboard

CREATE TABLE IF NOT EXISTS social_platforms (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default platforms only if the table is empty
INSERT INTO social_platforms (id, name, icon, color, url, is_active)
SELECT UUID(), 'Instagram', 'mdi-instagram', 'pink', 'https://instagram.com/ourlms', 1
WHERE NOT EXISTS (SELECT 1 FROM social_platforms WHERE name = 'Instagram');

INSERT INTO social_platforms (id, name, icon, color, url, is_active)
SELECT UUID(), 'LinkedIn', 'mdi-linkedin', 'blue-darken-2', 'https://linkedin.com/company/ourlms', 1
WHERE NOT EXISTS (SELECT 1 FROM social_platforms WHERE name = 'LinkedIn');

INSERT INTO social_platforms (id, name, icon, color, url, is_active)
SELECT UUID(), 'YouTube', 'mdi-youtube', 'red', 'https://youtube.com/ourlms', 1
WHERE NOT EXISTS (SELECT 1 FROM social_platforms WHERE name = 'YouTube');

INSERT INTO social_platforms (id, name, icon, color, url, is_active)
SELECT UUID(), 'Facebook', 'mdi-facebook', 'blue', 'https://facebook.com/ourlms', 1
WHERE NOT EXISTS (SELECT 1 FROM social_platforms WHERE name = 'Facebook');

INSERT INTO social_platforms (id, name, icon, color, url, is_active)
SELECT UUID(), 'Telegram', 'mdi-telegram', 'light-blue', 'https://t.me/ourlms', 1
WHERE NOT EXISTS (SELECT 1 FROM social_platforms WHERE name = 'Telegram');

INSERT INTO social_platforms (id, name, icon, color, url, is_active)
SELECT UUID(), 'WhatsApp Community', 'mdi-whatsapp', 'green', 'https://chat.whatsapp.com/ourlms', 1
WHERE NOT EXISTS (SELECT 1 FROM social_platforms WHERE name = 'WhatsApp Community');

INSERT INTO social_platforms (id, name, icon, color, url, is_active)
SELECT UUID(), 'GitHub', 'mdi-github', 'grey-darken-4', 'https://github.com/ourlms', 1
WHERE NOT EXISTS (SELECT 1 FROM social_platforms WHERE name = 'GitHub');
