-- Insert missing config key for homepage hero video url
INSERT IGNORE INTO system_config (`key`, `value`, `group`, `description`, `is_sensitive`) VALUES 
('homepage_hero_video_url', '', 'branding', 'Video URL for the homepage hero section (e.g., YouTube/Vimeo). Takes precedence over hero image.', FALSE);
