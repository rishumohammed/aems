-- Migration 064: Extend master_standards table with slug, description, banner_image, and meta_description
ALTER TABLE master_standards
ADD COLUMN slug VARCHAR(150) UNIQUE AFTER sub,
ADD COLUMN description LONGTEXT AFTER color,
ADD COLUMN banner_image TEXT AFTER description,
ADD COLUMN meta_description TEXT AFTER banner_image;

-- Backfill slugs for initial default standards
UPDATE master_standards SET slug = 'iso', description = '<p>ISO (International Organization for Standardization) certifications validate quality management systems, food safety protocols, and operational procedures to ensure consistency, excellence, and regulatory compliance globally.</p>' WHERE name = 'ISO' AND (slug IS NULL OR slug = '');

UPDATE master_standards SET slug = 'fssc', description = '<p>FSSC 22000 is a robust, ISO-based food safety management certification scheme accepted worldwide by GFSI (Global Food Safety Initiative) retailers and manufacturers.</p>' WHERE name = 'FSSC' AND (slug IS NULL OR slug = '');

UPDATE master_standards SET slug = 'brcgs', description = '<p>BRCGS (Brand Reputation Compliance Global Standards) provides global benchmark standards for food safety, packaging materials, storage, and distribution.</p>' WHERE name = 'BRCGS' AND (slug IS NULL OR slug = '');

UPDATE master_standards SET slug = 'ohsms', description = '<p>OHSMS (Occupational Health & Safety Management Systems) frameworks help organizations manage work hazards, protect workforce health, and minimize workplace risks.</p>' WHERE name = 'OHSMS' AND (slug IS NULL OR slug = '');

UPDATE master_standards SET slug = 'qms', description = '<p>Quality Management Systems (QMS) establish standardized procedures, risk management, and continuous improvement metrics across food production pipelines.</p>' WHERE name = 'QMS' AND (slug IS NULL OR slug = '');

UPDATE master_standards SET slug = 'haccp', description = '<p>HACCP (Hazard Analysis Critical Control Point) is a systematic preventive approach to food safety from biological, chemical, and physical hazards in production processes.</p>' WHERE name = 'HACCP' AND (slug IS NULL OR slug = '');
