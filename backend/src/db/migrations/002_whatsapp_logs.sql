-- Create whatsapp_logs table
CREATE TABLE IF NOT EXISTS whatsapp_logs (
    id CHAR(36) PRIMARY KEY,
    payload JSON NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
