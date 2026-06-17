-- AEMS Exam Portal Migration (006)
-- Extends the existing exams/exam_attempts/exam_questions tables
-- and adds exam_slots and exam_answers tables.

-- ─── Extend: exams ───────────────────────────────────────────────────────────
ALTER TABLE exams ADD COLUMN randomize_questions BOOLEAN DEFAULT FALSE;
ALTER TABLE exams ADD COLUMN randomize_options   BOOLEAN DEFAULT FALSE;
ALTER TABLE exams ADD COLUMN created_by          CHAR(36);
ALTER TABLE exams ADD COLUMN instructions        TEXT;
ALTER TABLE exams ADD COLUMN min_submit_pct      INT DEFAULT 50 COMMENT 'Min % of questions answered before submit is enabled';
ALTER TABLE exams ADD COLUMN requires_scheduling BOOLEAN DEFAULT FALSE COMMENT 'If true, student must book a slot';
ALTER TABLE exams ADD COLUMN show_result_detail  BOOLEAN DEFAULT TRUE COMMENT 'Show per-question review on results page';
ALTER TABLE exams ADD COLUMN created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE exams ADD COLUMN updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ─── Extend: exam_questions ───────────────────────────────────────────────────
ALTER TABLE exam_questions ADD COLUMN order_index INT DEFAULT 0;
ALTER TABLE exam_questions ADD COLUMN explanation TEXT COMMENT 'Shown to student post-exam if result detail is enabled';

-- ─── Extend: exam_attempts ────────────────────────────────────────────────────
ALTER TABLE exam_attempts
  ADD COLUMN status ENUM('scheduled','in_progress','submitted','graded','pending_manual_review') DEFAULT 'scheduled',
  ADD COLUMN answers_json              JSON        COMMENT 'Full snapshot of submitted answers',
  ADD COLUMN auto_score               INT DEFAULT 0,
  ADD COLUMN total_marks              INT DEFAULT 0,
  ADD COLUMN pending_manual_review    BOOLEAN DEFAULT FALSE,
  ADD COLUMN exam_session_token_hash  VARCHAR(255),
  ADD COLUMN session_expires_at       DATETIME;

-- ─── New: exam_slots ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_slots (
    id           CHAR(36) PRIMARY KEY,
    exam_id      CHAR(36) NOT NULL,
    starts_at    DATETIME NOT NULL,
    capacity     INT DEFAULT 1 COMMENT 'Max number of students for this slot',
    booked_count INT DEFAULT 0,
    created_by   CHAR(36),
    FOREIGN KEY (exam_id)    REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── New: exam_answers ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_answers (
    id               CHAR(36) PRIMARY KEY,
    attempt_id       CHAR(36) NOT NULL,
    question_id      CHAR(36) NOT NULL,
    answer_text      TEXT,
    marks_awarded    INT,
    is_correct       BOOLEAN,
    graded_by        CHAR(36),
    graded_at        DATETIME,
    FOREIGN KEY (attempt_id)  REFERENCES exam_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by)   REFERENCES users(id) ON DELETE SET NULL
);
