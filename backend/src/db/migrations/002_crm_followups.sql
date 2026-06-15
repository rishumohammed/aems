-- CRM Follow-ups Table
CREATE TABLE IF NOT EXISTS lead_followups (
    id CHAR(36) PRIMARY KEY,
    lead_id CHAR(36) NOT NULL,
    agent_id CHAR(36) NOT NULL,
    scheduled_at DATETIME NOT NULL,
    note TEXT,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add last_activity_at to leads for better sorting
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
