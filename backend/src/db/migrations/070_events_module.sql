-- Migration: 070_events_module
-- Description: Create events, event_registrations, and event_otps tables

CREATE TABLE IF NOT EXISTS events (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    image_url TEXT,
    registration_start DATETIME NOT NULL,
    registration_end DATETIME NOT NULL,
    event_start DATETIME NOT NULL,
    event_end DATETIME NULL,
    meet_link TEXT,
    status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'published',
    created_by CHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS event_registrations (
    id CHAR(36) PRIMARY KEY,
    event_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    occupation ENUM('Student', 'Working', 'Trainer') NOT NULL,
    organization VARCHAR(255) NOT NULL,
    college_name VARCHAR(255) NULL,
    company_name VARCHAR(255) NULL,
    institution_name VARCHAR(255) NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    reminder_sent_24h BOOLEAN DEFAULT FALSE,
    reminder_sent_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_registration (event_id, email)
);

CREATE TABLE IF NOT EXISTS event_otps (
    id CHAR(36) PRIMARY KEY,
    event_id CHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event_otp_lookup (event_id, email, otp)
);
