-- Migration: 044_invoice_payments_missing_columns
-- Adds missing installment_number column to invoice_payments

ALTER TABLE invoice_payments ADD COLUMN installment_number INT DEFAULT 1 AFTER paid_at;
