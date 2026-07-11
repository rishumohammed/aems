-- Adds scheduling date fields to public_exams

ALTER TABLE public_exams ADD COLUMN registration_end_date DATETIME NULL;
ALTER TABLE public_exams ADD COLUMN exam_start_date DATETIME NULL;
ALTER TABLE public_exams ADD COLUMN exam_end_date DATETIME NULL;
