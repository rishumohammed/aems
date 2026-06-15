-- LMS Authoring Updates

-- Update courses table
ALTER TABLE courses MODIFY COLUMN status ENUM('draft', 'pending_review', 'published', 'rejected', 'archived') DEFAULT 'draft';
ALTER TABLE courses ADD COLUMN rejection_reason TEXT AFTER status;
ALTER TABLE courses ADD COLUMN level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner' AFTER category_id;
ALTER TABLE courses ADD COLUMN language VARCHAR(50) DEFAULT 'English' AFTER level;
ALTER TABLE courses ADD COLUMN short_description TEXT AFTER description;
ALTER TABLE courses ADD COLUMN intro_video_source ENUM('youtube', 'vimeo') AFTER thumbnail_url;
ALTER TABLE courses ADD COLUMN intro_video_id VARCHAR(255) AFTER intro_video_source;

-- Update course_categories table
ALTER TABLE course_categories ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE course_categories ADD COLUMN description TEXT;
ALTER TABLE course_categories ADD COLUMN order_index INT DEFAULT 0;

-- Update course_lessons table
ALTER TABLE course_lessons ADD COLUMN notes TEXT AFTER title;
ALTER TABLE course_lessons ADD COLUMN thumbnail_url TEXT AFTER video_id;
ALTER TABLE course_lessons ADD COLUMN resource_url TEXT AFTER thumbnail_url;
ALTER TABLE course_lessons ADD COLUMN live_date DATE AFTER resource_url;
ALTER TABLE course_lessons ADD COLUMN live_time TIME AFTER live_date;
ALTER TABLE course_lessons ADD COLUMN zoom_link TEXT AFTER live_time;

-- Prerequisites table for courses
CREATE TABLE IF NOT EXISTS course_prerequisites (
    course_id CHAR(36) NOT NULL,
    prerequisite_course_id CHAR(36) NOT NULL,
    PRIMARY KEY (course_id, prerequisite_course_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id) ON DELETE CASCADE
);
