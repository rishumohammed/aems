-- 1. Add notification_settings column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_settings JSON DEFAULT NULL;
