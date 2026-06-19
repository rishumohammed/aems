-- Migration: 043_invoice_missing_columns
-- Adds missing columns to the invoices table that were being used in the application but missed in previous migrations

ALTER TABLE invoices ADD COLUMN invoice_number VARCHAR(50) NULL UNIQUE AFTER id;
ALTER TABLE invoices ADD COLUMN total_fee DECIMAL(10,2) DEFAULT 0.00 AFTER amount;
ALTER TABLE invoices ADD COLUMN balance_amount DECIMAL(10,2) DEFAULT 0.00 AFTER balance_due;

ALTER TABLE invoices MODIFY COLUMN payment_status ENUM('paid', 'partial', 'pending', 'voided') DEFAULT 'pending';

ALTER TABLE invoices ADD COLUMN pdf_path VARCHAR(255) NULL;
ALTER TABLE invoices ADD COLUMN payment_reference VARCHAR(255) NULL;
ALTER TABLE invoices ADD COLUMN due_date DATE NULL;
ALTER TABLE invoices ADD COLUMN last_payment_date TIMESTAMP NULL;
ALTER TABLE invoices ADD COLUMN deleted_at TIMESTAMP NULL;
