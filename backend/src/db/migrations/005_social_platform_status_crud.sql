-- Migration: Social Platform Status CRUD
-- Description: Replaces student_social_follows with proper CRUD tracking table

-- Drop old table
DROP TABLE IF EXISTS student_social_follows;

-- Create new table with CRUD standards
CREATE TABLE IF NOT EXISTS student_social_platform_status (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    platform_name VARCHAR(100) NOT NULL,
    followed_status ENUM('followed', 'unfollowed') DEFAULT 'followed',
    followed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_platform (student_id, platform_name)
);
