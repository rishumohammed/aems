-- ============================================================
-- AEMS DATABASE CLEANUP SCRIPT
-- Clears ALL data EXCEPT: users, user_profiles, student_profiles,
--   tutor_profiles, employer_profiles, sessions, system_config,
--   course_categories, job_categories, public_exam_categories,
--   social_platforms, currencies, master_standards
-- ============================================================

USE aems;

SET FOREIGN_KEY_CHECKS = 0;

-- ── Audit / Auth Logs ────────────────────────────────────────
TRUNCATE TABLE auth_logs;
TRUNCATE TABLE audit_logs;

-- ── Notifications ────────────────────────────────────────────
TRUNCATE TABLE notifications;
TRUNCATE TABLE employer_notifications;

-- ── Messaging / Conversations ────────────────────────────────
TRUNCATE TABLE messages;
TRUNCATE TABLE conversations;

-- ── Whatsapp Logs ────────────────────────────────────────────
TRUNCATE TABLE whatsapp_logs;

-- ── Notice Board ─────────────────────────────────────────────
TRUNCATE TABLE notice_board;

-- ── Live Events (Standalone) ──────────────────────────────────
TRUNCATE TABLE live_events;

-- ── Certificates ─────────────────────────────────────────────
TRUNCATE TABLE cert_verification_logs;
TRUNCATE TABLE certificates;

-- ── Public Exam Portal ────────────────────────────────────────
TRUNCATE TABLE public_exam_results;
TRUNCATE TABLE public_exam_attempts;
TRUNCATE TABLE public_exam_certificates;
TRUNCATE TABLE public_exam_candidates;
TRUNCATE TABLE public_exam_questions;
TRUNCATE TABLE public_exams;

-- ── LMS Exam Portal ───────────────────────────────────────────
TRUNCATE TABLE exam_answers;
TRUNCATE TABLE exam_attempts;
TRUNCATE TABLE exam_slots;
TRUNCATE TABLE exam_questions;
TRUNCATE TABLE exams;

-- ── Assignments ───────────────────────────────────────────────
TRUNCATE TABLE assignment_submissions;
TRUNCATE TABLE assignments;

-- ── Job Placements / Interviews ───────────────────────────────
TRUNCATE TABLE job_placements;
TRUNCATE TABLE job_interviews;

-- ── Job Applications ──────────────────────────────────────────
TRUNCATE TABLE job_applications;

-- ── Jobs ──────────────────────────────────────────────────────
TRUNCATE TABLE jobs;

-- ── Invoices & Payments ───────────────────────────────────────
TRUNCATE TABLE invoice_payments;
TRUNCATE TABLE invoices;

-- ── Expenses ──────────────────────────────────────────────────
TRUNCATE TABLE expenses;

-- ── Enrollments & Lesson Progress ────────────────────────────
TRUNCATE TABLE lesson_progress;
TRUNCATE TABLE enrollments;

-- ── Course Q&A ────────────────────────────────────────────────
TRUNCATE TABLE course_qa_replies;
TRUNCATE TABLE course_qa;

-- ── Course Announcements ──────────────────────────────────────
TRUNCATE TABLE course_announcements;

-- ── Course Content ────────────────────────────────────────────
TRUNCATE TABLE course_lessons;
TRUNCATE TABLE course_sections;
TRUNCATE TABLE course_modules;
TRUNCATE TABLE course_prerequisites;
TRUNCATE TABLE courses;

-- ── CRM / Leads ───────────────────────────────────────────────
TRUNCATE TABLE lead_followups;
TRUNCATE TABLE lead_activities;
TRUNCATE TABLE lead_custom_fields;
TRUNCATE TABLE leads;
TRUNCATE TABLE lead_form_configs;

-- ── External Certificates ─────────────────────────────────────
TRUNCATE TABLE external_certificates;

-- ── Testimonials / CMS ───────────────────────────────────────
TRUNCATE TABLE testimonials;
TRUNCATE TABLE contact_submissions;

-- ── Social ───────────────────────────────────────────────────
TRUNCATE TABLE student_social_platform_status;
TRUNCATE TABLE student_social_follows;

-- ── Terms Acceptances ─────────────────────────────────────────
TRUNCATE TABLE terms_privacy_acceptances;

-- ── Student Guides ────────────────────────────────────────────
TRUNCATE TABLE student_guides;

-- ── Student Job Categories ────────────────────────────────────
TRUNCATE TABLE student_job_categories;

SET FOREIGN_KEY_CHECKS = 1;

-- ── Summary ───────────────────────────────────────────────────
SELECT 'Data cleared successfully!' AS status;
SELECT 'Preserved: users, user_profiles, student_profiles, tutor_profiles,' AS preserved_tables;
SELECT 'employer_profiles, sessions, system_config, course_categories,' AS preserved_tables2;
SELECT 'job_categories, public_exam_categories, social_platforms,' AS preserved_tables3;
SELECT 'currencies, master_standards, cert_template_config, institute_info,' AS preserved_tables4;
SELECT 'team_members, accreditations, recruiters' AS preserved_tables5;
