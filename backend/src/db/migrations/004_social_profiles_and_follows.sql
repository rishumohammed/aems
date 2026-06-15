-- Migration: Social Profiles and Follows
-- Description: Adds social profile URLs to student_profiles and creates table for platform follows.

-- 1. Add social URL columns to student_profiles
ALTER TABLE student_profiles
ADD COLUMN github_url VARCHAR(255),
ADD COLUMN portfolio_url VARCHAR(255),
ADD COLUMN instagram_url VARCHAR(255),
ADD COLUMN twitter_url VARCHAR(255),
ADD COLUMN youtube_url VARCHAR(255),
ADD COLUMN other_urls JSON;

-- 2. Create student_social_follows table
CREATE TABLE IF NOT EXISTS student_social_follows (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    platform_name VARCHAR(100) NOT NULL,
    is_followed BOOLEAN DEFAULT FALSE,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_platform (student_id, platform_name)
);
