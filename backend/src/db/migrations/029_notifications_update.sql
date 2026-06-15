-- Notifications Update Migration
-- Renames 'body' to 'message' to match the system validation rules

ALTER TABLE notifications CHANGE COLUMN body message TEXT;
