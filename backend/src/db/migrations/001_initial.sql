-- AEMS Initial Schema

-- CREATE DATABASE IF NOT EXISTS aems_db;
-- USE aems_db;

-- Core Tables
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    role ENUM('super_admin', 'crm_agent', 'tutor', 'student', 'employer', 'visitor') NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id CHAR(36) PRIMARY KEY,
    avatar_url TEXT,
    bio TEXT,
    linkedin VARCHAR(255),
    qualification VARCHAR(255),
    field_of_study VARCHAR(255),
    graduation_year INT,
    employment_status ENUM('employed', 'unemployed', 'freelancer', 'fresher'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_profiles (
    user_id CHAR(36) PRIMARY KEY,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    address TEXT,
    linkedin_url VARCHAR(255),
    experience_years INT DEFAULT 0,
    current_status ENUM('employed', 'unemployed', 'freelancer', 'fresher'),
    last_company VARCHAR(255),
    last_role VARCHAR(255),
    last_role_duration VARCHAR(50),
    skills JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- LMS Tables
CREATE TABLE IF NOT EXISTS course_categories (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    icon VARCHAR(50),
    parent_id CHAR(36),
    FOREIGN KEY (parent_id) REFERENCES course_categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS courses (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    tutor_id CHAR(36),
    category_id CHAR(36),
    price_type ENUM('fixed', 'custom') DEFAULT 'fixed',
    price DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    thumbnail_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS course_sections (
    id CHAR(36) PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_lessons (
    id CHAR(36) PRIMARY KEY,
    section_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type ENUM('video', 'live', 'text', 'resource') NOT NULL,
    video_source ENUM('youtube', 'vimeo'),
    video_id VARCHAR(255),
    duration_seconds INT DEFAULT 0,
    is_free_preview BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL,
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_percentage INT DEFAULT 0,
    status ENUM('active', 'completed', 'suspended') DEFAULT 'active',
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id CHAR(36) PRIMARY KEY,
    enrollment_id CHAR(36) NOT NULL,
    lesson_id CHAR(36) NOT NULL,
    watched_seconds INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE
);

-- CRM Tables
CREATE TABLE IF NOT EXISTS leads (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    source ENUM('website', 'whatsapp', 'manual') DEFAULT 'website',
    status ENUM('open', 'called', 'interested', 'not_interested', 'rejected', 'converted') DEFAULT 'open',
    course_interest_id CHAR(36),
    notes TEXT,
    assigned_to CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_interest_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lead_custom_fields (
    id CHAR(36) PRIMARY KEY,
    lead_id CHAR(36) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_value TEXT,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lead_activities (
    id CHAR(36) PRIMARY KEY,
    lead_id CHAR(36) NOT NULL,
    agent_id CHAR(36),
    type ENUM('call', 'note', 'whatsapp', 'email', 'status_change') NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lead_form_configs (
    id CHAR(36) PRIMARY KEY,
    form_name VARCHAR(255) NOT NULL,
    fields_json JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam Tables
CREATE TABLE IF NOT EXISTS exams (
    id CHAR(36) PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT DEFAULT 60,
    pass_percentage INT DEFAULT 50,
    max_attempts INT DEFAULT 1,
    proctoring_enabled BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_questions (
    id CHAR(36) PRIMARY KEY,
    exam_id CHAR(36) NOT NULL,
    question_text TEXT NOT NULL,
    type ENUM('mcq', 'truefalse', 'short', 'long') NOT NULL,
    options_json JSON,
    correct_answer TEXT,
    marks INT DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_attempts (
    id CHAR(36) PRIMARY KEY,
    exam_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME,
    score INT DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    proctoring_log_json JSON,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    exam_attempt_id CHAR(36),
    cert_number VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'revoked') DEFAULT 'active',
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_attempt_id) REFERENCES exam_attempts(id) ON DELETE SET NULL
);

-- Job Board
CREATE TABLE IF NOT EXISTS job_categories (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS jobs (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(100) NOT NULL,
    category CHAR(36),
    location VARCHAR(255),
    type ENUM('full_time', 'part_time', 'contract', 'internship') DEFAULT 'full_time',
    salary_range VARCHAR(100),
    description TEXT,
    requirements_json JSON,
    apply_url TEXT,
    posted_by CHAR(36),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category) REFERENCES job_categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS job_applications (
    id CHAR(36) PRIMARY KEY,
    job_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('applied', 'viewed', 'shortlisted', 'rejected') DEFAULT 'applied',
    cover_note TEXT,
    resume_path TEXT,
    applicant_name VARCHAR(255),
    applicant_email VARCHAR(255),
    applicant_phone VARCHAR(20),
    qualification VARCHAR(255),
    field_of_study VARCHAR(255),
    institution VARCHAR(255),
    year_of_passing INT,
    grade VARCHAR(50),
    experience_years INT DEFAULT 0,
    last_company VARCHAR(255),
    last_role VARCHAR(255),
    skills_json JSON,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Billing & Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    course_id CHAR(36),
    amount DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0.00,
    balance_due DECIMAL(10, 2) DEFAULT 0.00,
    payment_mode ENUM('online', 'offline') DEFAULT 'online',
    payment_status ENUM('paid', 'partial', 'pending') DEFAULT 'pending',
    gateway_order_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS invoice_payments (
    id CHAR(36) PRIMARY KEY,
    invoice_id CHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    mode ENUM('bank_transfer', 'cash', 'card', 'cheque') NOT NULL,
    reference VARCHAR(255),
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id CHAR(36) PRIMARY KEY,
    category ENUM('operations', 'marketing', 'infrastructure', 'salaries', 'tutor_payouts', 'miscellaneous') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('debit', 'credit') DEFAULT 'debit',
    description TEXT,
    payment_mode ENUM('bank_transfer', 'cash', 'card', 'cheque') DEFAULT 'bank_transfer',
    reference_number VARCHAR(100),
    receipt_path TEXT,
    date DATE NOT NULL,
    recorded_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- CMS & About Information (Single Row Tables or Configurations)
CREATE TABLE IF NOT EXISTS institute_info (
    id CHAR(36) PRIMARY KEY,
    institute_name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    story_para_1 TEXT,
    story_para_2 TEXT,
    story_para_3 TEXT,
    mission TEXT,
    vision TEXT,
    approach TEXT,
    promise TEXT,
    address TEXT,
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    email_general VARCHAR(255),
    email_admissions VARCHAR(255),
    office_hours VARCHAR(100),
    founded_year INT,
    city VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS team_members (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role_title VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_initials VARCHAR(5),
    avatar_gradient_start VARCHAR(20),
    avatar_gradient_end VARCHAR(20),
    qualification_badge VARCHAR(100),
    experience_years INT,
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS accreditations (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    icon_emoji VARCHAR(10),
    description TEXT,
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS recruiters (
    id CHAR(36) PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    icon_emoji VARCHAR(10),
    hire_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
    id CHAR(36) PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    avatar_initials VARCHAR(5),
    avatar_color VARCHAR(20),
    course_id CHAR(36),
    employer_name VARCHAR(100),
    job_title VARCHAR(100),
    salary_lpa DECIMAL(5, 2),
    city VARCHAR(100),
    quote TEXT,
    before_description TEXT,
    after_description TEXT,
    months_to_placement INT,
    exam_score INT,
    interview_count INT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS contact_submissions (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('new', 'read', 'replied') DEFAULT 'new'
);
