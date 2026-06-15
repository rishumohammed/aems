-- Migration: 027_offline_payments
-- Adds offline payment support: proof uploads, status tracking, UPI mode

-- 1. Add status, proof_path, remarks to invoice_payments
ALTER TABLE invoice_payments
  ADD COLUMN IF NOT EXISTS status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS proof_path VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS remarks TEXT NULL,
  ADD COLUMN IF NOT EXISTS reviewed_by CHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP NULL;

-- 2. Expand mode ENUM to include UPI
ALTER TABLE invoice_payments
  MODIFY COLUMN mode ENUM('bank_transfer', 'cash', 'card', 'cheque', 'upi') NOT NULL;

-- 3. Add 'suspended_offline' to enrollments status for offline pending approvals
ALTER TABLE enrollments
  MODIFY COLUMN status ENUM('active', 'completed', 'suspended', 'suspended_offline') NOT NULL DEFAULT 'active';
