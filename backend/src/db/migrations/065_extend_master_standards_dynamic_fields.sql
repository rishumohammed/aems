-- Migration 065: Add dynamic JSON and sidebar fields to master_standards table
ALTER TABLE master_standards
ADD COLUMN scope VARCHAR(150) DEFAULT 'International Standard' AFTER meta_description,
ADD COLUMN compliance_info VARCHAR(150) DEFAULT 'GFSI & ISO Aligned' AFTER scope,
ADD COLUMN highlights_json TEXT AFTER compliance_info,
ADD COLUMN benefits_json TEXT AFTER highlights_json;

-- Update existing default standards with default JSON structures if null
UPDATE master_standards 
SET 
  scope = 'International Standard',
  compliance_info = 'GFSI & ISO Aligned',
  highlights_json = '[{"icon":"mdi-earth","title":"Global Standard","sub":"Worldwide Acceptance"},{"icon":"mdi-shield-check","title":"Audit Ready","sub":"GFSI Benchmarked"},{"icon":"mdi-school","title":"Expert Training","sub":"Certified Lead Auditors"},{"icon":"mdi-file-document-check","title":"Verifiable Certs","sub":"Online Validation"}]',
  benefits_json = '[{"title":"Global Market Access","desc":"Fulfill compliance expectations required by international retailers and buyers."},{"title":"Risk Reduction","desc":"Identify critical control points to minimize food safety and operational hazards."},{"title":"Process Efficiency","desc":"Standardize management procedures to improve productivity and quality."},{"title":"Brand Trust & Recognition","desc":"Demonstrate commitment to international food safety and quality standards."}]'
WHERE highlights_json IS NULL;
