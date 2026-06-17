-- Migration 031: Add temp_password to users
ALTER TABLE users
ADD COLUMN temp_password VARCHAR(255) DEFAULT NULL;
