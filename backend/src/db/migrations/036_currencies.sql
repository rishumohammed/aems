CREATE TABLE IF NOT EXISTS currencies (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
    is_base BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert a default base currency if table is empty
INSERT IGNORE INTO currencies (id, code, symbol, name, exchange_rate, is_base, is_active)
VALUES (UUID(), 'INR', '₹', 'Indian Rupee', 1.0000, TRUE, TRUE);
