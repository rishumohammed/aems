-- Migration 062: Add hide_company_name option to jobs table
ALTER TABLE jobs 
ADD COLUMN hide_company_name BOOLEAN DEFAULT FALSE;
