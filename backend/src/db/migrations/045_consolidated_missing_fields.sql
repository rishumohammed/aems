-- Migration: 045_consolidated_missing_fields
-- Adds missing tables and columns that were manually added to the DB but never committed

-- 1. Missing Tables
CREATE TABLE IF NOT EXISTS `payment_webhook_logs` (
  `id` char(36) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `proctoring_events` (
  `id` char(36) NOT NULL,
  `attempt_id` char(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata_json`)),
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `attempt_id` (`attempt_id`),
  CONSTRAINT `proctoring_events_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` char(36) NOT NULL,
  `course_id` char(36) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `time_limit` int(11) DEFAULT NULL,
  `passing_score` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` char(36) NOT NULL,
  `quiz_id` char(36) DEFAULT NULL,
  `question_text` text DEFAULT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `correct_index` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
);

-- 2. Missing Columns
ALTER TABLE course_qa ADD COLUMN status enum('open','answered','pending_review','closed') DEFAULT 'open';
ALTER TABLE enrollments ADD COLUMN completed_at timestamp NULL;
ALTER TABLE enrollments ADD COLUMN email_sent_status tinyint(1) DEFAULT 0;
ALTER TABLE enrollments ADD COLUMN certificate_generated tinyint(1) DEFAULT 0;
ALTER TABLE expenses ADD COLUMN deleted_at timestamp NULL;
ALTER TABLE jobs ADD COLUMN is_remote tinyint(1) DEFAULT 0;
ALTER TABLE jobs ADD COLUMN deadline date NULL;
ALTER TABLE leads ADD COLUMN form_id varchar(50) NULL;
ALTER TABLE public_exam_candidates ADD COLUMN login_count int(11) DEFAULT 0;
ALTER TABLE public_exam_candidates ADD COLUMN last_login_at datetime NULL;
ALTER TABLE public_exam_candidates ADD COLUMN registration_status enum('pending','approved') DEFAULT 'pending';
ALTER TABLE public_exams ADD COLUMN registration_status enum('open','closed') DEFAULT 'open';
ALTER TABLE public_exams ADD COLUMN enable_proctoring tinyint(1) DEFAULT 0;
ALTER TABLE public_exams ADD COLUMN max_proctoring_warnings int(11) DEFAULT 3;
ALTER TABLE public_exams ADD COLUMN enforce_fullscreen tinyint(1) DEFAULT 0;
ALTER TABLE student_guides ADD COLUMN greeting text NULL;
ALTER TABLE users ADD COLUMN reset_token varchar(255) NULL;
ALTER TABLE users ADD COLUMN reset_expires datetime NULL;
