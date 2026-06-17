-- AEMS Communication & Interactive Layer Migration

-- 1. Update course_lessons for live sessions
ALTER TABLE course_lessons 
ADD COLUMN scheduled_at DATETIME AFTER type,
ADD COLUMN duration_minutes INT AFTER scheduled_at,
ADD COLUMN live_link TEXT AFTER duration_minutes;

-- 2. Course Q&A
CREATE TABLE IF NOT EXISTS course_qa (
    id CHAR(36) PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    lesson_id CHAR(36),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS course_qa_replies (
    id CHAR(36) PRIMARY KEY,
    question_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    body TEXT NOT NULL,
    parent_reply_id CHAR(36),
    upvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES course_qa(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_reply_id) REFERENCES course_qa_replies(id) ON DELETE CASCADE
);

-- 3. Course Announcements
CREATE TABLE IF NOT EXISTS course_announcements (
    id CHAR(36) PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    tutor_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Messaging
CREATE TABLE IF NOT EXISTS conversations (
    id CHAR(36) PRIMARY KEY,
    participant_a_id CHAR(36) NOT NULL,
    participant_b_id CHAR(36) NOT NULL,
    course_id CHAR(36),
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_a_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_b_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id CHAR(36) PRIMARY KEY,
    conversation_id CHAR(36) NOT NULL,
    sender_id CHAR(36) NOT NULL,
    body TEXT NOT NULL,
    read_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
