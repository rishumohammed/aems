-- Remove duplicates by keeping the one with the lowest ID for each name
DELETE t1 FROM master_standards t1
INNER JOIN master_standards t2 
WHERE t1.id > t2.id AND t1.name = t2.name;

-- Add unique constraint to prevent future duplication
ALTER TABLE master_standards ADD UNIQUE (name);
