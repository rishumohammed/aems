-- Migration 063: Clean default 'Brixify' company names from jobs table
UPDATE jobs 
SET company = NULL 
WHERE company = 'Brixify' AND (posted_by IN (SELECT id FROM users WHERE role IN ('super_admin', 'sub_admin', 'placement_coordinator')) OR posted_by IS NULL);

UPDATE jobs 
SET company = 'Confidential Organization' 
WHERE hide_company_name = 1;
