import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { createNotification } from '../services/notification.service.js';
import { pool } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import courseCompletionService from '../services/course-completion.service.js';

const router = express.Router();

// Student Dashboard Stats
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    const [enrollments] = await pool.query(`
      SELECT e.*, c.title, c.thumbnail_url, c.slug,
             u.name as instructor_name,
             (SELECT payment_status FROM invoices i WHERE i.student_id = e.student_id AND i.course_id = e.course_id ORDER BY created_at DESC LIMIT 1) as payment_status,
             (SELECT COUNT(*) FROM course_lessons cl 
              JOIN course_sections cs ON cl.section_id = cs.id 
              WHERE cs.course_id = c.id) as total_lessons,
             (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id = e.id AND lp.completed = TRUE) as completed_lessons,
             EXISTS(SELECT 1 FROM exams ex WHERE ex.course_id = c.id) as has_exam,
             EXISTS(SELECT 1 FROM exam_attempts ea JOIN exams ex ON ea.exam_id = ex.id WHERE ex.course_id = c.id AND ea.student_id = e.student_id AND ea.passed = TRUE) as passed_exam
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.tutor_id = u.id
      WHERE e.student_id = ?
    `, [userId]);

    const [stats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM enrollments WHERE student_id = ? AND status = 'completed') as completed_courses,
        (SELECT COUNT(*) FROM enrollments WHERE student_id = ? AND status = 'active') as active_enrollments,
        (SELECT COUNT(*) FROM certificates WHERE student_id = ?) as certificates_earned,
        (SELECT COUNT(*) FROM assignments a 
         JOIN enrollments e ON a.course_id = e.course_id 
         WHERE e.student_id = ? AND a.id NOT IN (SELECT assignment_id FROM assignment_submissions WHERE student_id = ?)) as pending_assignments,
        (SELECT COUNT(*) FROM exams ex 
         JOIN enrollments e ON ex.course_id = e.course_id 
         WHERE e.student_id = ? AND ex.id NOT IN (SELECT exam_id FROM exam_attempts WHERE student_id = ?)) as upcoming_exams,
        (SELECT COUNT(*) FROM job_applications WHERE student_id = ?) as job_applications
    `, [userId, userId, userId, userId, userId, userId, userId, userId]);

    const [exams] = await pool.query(`
      SELECT ex.title, ex.id, c.title as course_title, ea.score, ea.passed, ea.submitted_at
      FROM exam_attempts ea
      JOIN exams ex ON ea.exam_id = ex.id
      JOIN courses c ON ex.course_id = c.id
      WHERE ea.student_id = ?
      ORDER BY ea.submitted_at DESC
      LIMIT 5
    `, [userId]);

    const [recommended] = await pool.query(`
      SELECT c.*, cat.name as category_name, u.name as instructor_name
      FROM courses c
      JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.tutor_id = u.id
      WHERE c.id NOT IN (SELECT course_id FROM enrollments WHERE student_id = ?)
      AND c.status = 'published'
      LIMIT 4
    `, [userId]);

    const [profile] = await pool.query('SELECT skills FROM student_profiles WHERE user_id = ?', [userId]);
    const skills = profile[0]?.skills || [];
    const resumeCompletion = Math.min(100, (skills.length * 10) + 40); // Simple mock logic

    const [pendingAssignments] = await pool.query(`
      SELECT a.*, c.title as course_title, c.slug as course_slug
      FROM assignments a
      JOIN enrollments e ON a.course_id = e.course_id
      JOIN courses c ON a.course_id = c.id
      WHERE e.student_id = ? 
      AND a.id NOT IN (SELECT assignment_id FROM assignment_submissions WHERE student_id = ?)
      ORDER BY a.due_date ASC
      LIMIT 5
    `, [userId, userId]);

    res.json({
      enrollments,
      stats: stats[0],
      examSummary: exams,
      pendingAssignments,
      recommendedCourses: recommended,
      jobStats: {
        resumeCompletion,
        applicationsSubmitted: stats[0].job_applications,
        recommendedJobsCount: 12 // Mock
      }
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Course Curriculum with Progress
router.get('/courses/:courseId/curriculum', async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check enrollment
    const [enrollmentRecord] = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
      [userId, courseId]
    );

    const isEnrolled = enrollmentRecord.length > 0;
    const enrollmentId = isEnrolled ? enrollmentRecord[0].id : null;

    // Check Option A (Allow course access after partial payment)
    let hasPaymentAccess = true;
    if (isEnrolled) {
      const [invoices] = await pool.query(
        'SELECT payment_status FROM invoices WHERE student_id = ? AND course_id = ?',
        [userId, courseId]
      );
      if (invoices.length > 0) {
        const paymentStatus = invoices[0].payment_status;
        if (paymentStatus !== 'paid') {
          if (paymentStatus === 'partial') {
            // Unconditionally allow access for partial payments
            hasPaymentAccess = true;
          } else {
            // pending or voided
            hasPaymentAccess = false;
          }
        }
      }
    }

    const [sections] = await pool.query(`
      SELECT * FROM course_sections 
      WHERE course_id = ? 
      ORDER BY order_index ASC
    `, [courseId]);

    const sectionIds = sections.map(s => s.id);
    if (sectionIds.length === 0) return res.json([]);

    // Fetch Lessons (with progress)
    let lessons = [];
    if (sectionIds.length > 0) {
      const [lessonsData] = await pool.query(`
        SELECT l.*, p.watched_seconds, p.completed
        FROM course_lessons l
        LEFT JOIN lesson_progress p ON l.id = p.lesson_id AND p.enrollment_id = ?
        WHERE l.section_id IN (?)
        ORDER BY l.order_index ASC
      `, [enrollmentId, sectionIds]);
      lessons = lessonsData;
    }

    // Strip sensitive content for locked lessons if not enrolled or if payment access is restricted
    const sanitizedLessons = lessons.map(l => {
      const isAccessible = (isEnrolled && hasPaymentAccess) || l.is_free_preview;
      if (!isAccessible) {
        return {
          id: l.id,
          section_id: l.section_id,
          module_id: l.module_id,
          title: l.title,
          type: l.type,
          is_free_preview: false,
          is_locked: true,
          order_index: l.order_index,
          is_mandatory: l.is_mandatory
        };
      }
      return { ...l, is_locked: false };
    });

    // Group lessons into sections and wrap them in a dummy module for frontend compatibility
    const curriculum = sections.map(section => {
      const sectLessons = sanitizedLessons.filter(l => l.section_id === section.id);
      const totalLessons = sectLessons.length;
      const completedLessons = sectLessons.filter(l => l.completed).length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const completed = totalLessons > 0 && completedLessons === totalLessons;

      const dummyModule = {
        id: section.id,
        title: section.title,
        lessons: sectLessons,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        progress_percentage: progressPercentage,
        completed
      };

      return {
        ...section,
        modules: [dummyModule],
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        progress_percentage: progressPercentage,
        completed
      };
    });

    res.json(curriculum);
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Track Progress
router.post('/progress', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { lesson_id, enrollment_id, watched_seconds, completed } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const [enrollment] = await pool.query(
      'SELECT id, course_id FROM enrollments WHERE id = ? AND student_id = ?',
      [enrollment_id, userId]
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check Option A payment restrictions for progress tracking
    const [invoices] = await pool.query(
      'SELECT payment_status FROM invoices WHERE student_id = ? AND course_id = ?',
      [userId, enrollment[0].course_id]
    );
    if (invoices.length > 0) {
      const paymentStatus = invoices[0].payment_status;
      if (paymentStatus !== 'paid') {
        let hasPaymentAccess = true;
        if (paymentStatus === 'partial') {
          hasPaymentAccess = true; // Unconditionally allow progress tracking for partial payments
        } else {
          hasPaymentAccess = false; // pending or voided
        }
        if (!hasPaymentAccess) {
          // Check if lesson is free preview
          const [lessons] = await pool.query('SELECT is_free_preview FROM course_lessons WHERE id = ?', [lesson_id]);
          if (lessons.length === 0 || !lessons[0].is_free_preview) {
            return res.status(403).json({ message: 'Payment required to access this lesson.' });
          }
        }
      }
    }

    // Check if the lesson is a mandatory exam and block manual completion
    if (completed) {
      const [lessonData] = await pool.query('SELECT type, is_mandatory FROM course_lessons WHERE id = ?', [lesson_id]);
      if (lessonData.length > 0 && (lessonData[0].type === 'quiz' || lessonData[0].type === 'exam') && lessonData[0].is_mandatory) {
        return res.status(403).json({ message: 'Cannot manually mark a mandatory exam as completed.' });
      }
    }

    await connection.beginTransaction();

    // Upsert progress
    await connection.query(`
      INSERT INTO lesson_progress (id, enrollment_id, lesson_id, watched_seconds, completed, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        watched_seconds = GREATEST(watched_seconds, VALUES(watched_seconds)),
        completed = CASE WHEN completed = TRUE THEN TRUE ELSE VALUES(completed) END,
        completed_at = CASE WHEN completed = TRUE AND completed_at IS NULL THEN VALUES(completed_at) ELSE completed_at END
    `, [
      uuidv4(), enrollment_id, lesson_id, watched_seconds, completed, completed ? new Date() : null
    ]);

    // Recalculate enrollment completion
    const [counts] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM lesson_progress WHERE enrollment_id = ? AND completed = TRUE) as completed_count,
        (SELECT COUNT(*) FROM course_lessons cl 
         JOIN course_sections cs ON cl.section_id = cs.id 
         WHERE cs.course_id = ?) as total_count
    `, [enrollment_id, enrollment[0].course_id]);

    const { completed_count, total_count } = counts[0];
    const percentage = total_count > 0 ? Math.round((completed_count / total_count) * 100) : 0;

    await connection.query(
      'UPDATE enrollments SET completion_percentage = ? WHERE id = ?',
      [percentage, enrollment_id]
    );

    await connection.commit();

    let course_completed = false;
    if (percentage === 100) {
      course_completed = await courseCompletionService.validateAndCompleteCourse(userId, enrollment[0].course_id, enrollment_id);
    }

    res.json({ message: 'Progress saved', completion_percentage: percentage, course_completed });
  } catch (error) {
    await connection.rollback();
    console.error('Error saving progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
});
// Get upcoming live sessions
router.get('/live-sessions', async (req, res) => {
  try {
    const userId = req.user.id;
    const [sessions] = await pool.query(`
      SELECT l.*, c.title as course_title, c.slug as course_slug
      FROM course_lessons l
      JOIN course_sections s ON l.section_id = s.id
      JOIN courses c ON s.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      WHERE l.type = 'live' 
      AND e.student_id = ?
      AND l.scheduled_at > NOW()
      ORDER BY l.scheduled_at ASC
      LIMIT 5
    `, [userId]);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get predefined guide characters
router.get('/guide-presets', async (req, res) => {
  const presets = [
    {
      id: 'sherlock',
      name: 'Sherlock Holmes',
      description: 'A brilliant detective who will help you deduce the best learning path.',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sherlock&backgroundColor=c0aede',
      greeting: 'Data! Data! Data! I cannot make bricks without clay. Let us begin our investigation into this course.'
    },
    {
      id: 'gandalf',
      name: 'Gandalf',
      description: 'A wise wizard guiding you through the perilous journey of learning.',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gandalf&backgroundColor=b6e3f4',
      greeting: 'All we have to decide is what to do with the time that is given us. Shall we study?'
    },
    {
      id: 'hermione',
      name: 'Hermione Granger',
      description: 'An exceptional student who knows the library inside out.',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Hermione&backgroundColor=ffdfbf',
      greeting: "It's wing-gar-dium levi-o-sa, make the 'gar' nice and long. Now, let's focus on your lessons."
    },
    {
      id: 'atticus',
      name: 'Atticus Finch',
      description: 'A symbol of integrity and wisdom to guide your ethical learning.',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Atticus&backgroundColor=d1d4db',
      greeting: "You never really understand a person until you consider things from his point of view... until you climb into his skin and walk around in it. Let's start learning."
    },
    {
      id: 'aslan',
      name: 'Aslan',
      description: 'A noble guide providing strength and courage on your path.',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aslan&backgroundColor=fef3c7',
      greeting: 'Courage, dear heart. The journey of knowledge is long, but you do not walk it alone.'
    },
    {
      id: 'elizabeth',
      name: 'Elizabeth Bennet',
      description: 'Sharp-witted and observant, helping you navigate complex topics.',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Elizabeth&backgroundColor=fce7f3',
      greeting: 'I must confess that I am much more inclined to be amused than to be offended. Shall we examine these lessons with a keen eye?'
    }
  ];
  res.json(presets);
});

// Save guide configuration
router.post('/guide', async (req, res) => {
  try {
    const userId = req.user.id;
    const { base_character, custom_name, visual_style, avatar_url, greeting } = req.body;
    
    await pool.query(`
      INSERT INTO student_guides (id, student_id, base_character, custom_name, visual_style, avatar_url, greeting)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        base_character = VALUES(base_character),
        custom_name = VALUES(custom_name),
        visual_style = VALUES(visual_style),
        avatar_url = VALUES(avatar_url),
        greeting = VALUES(greeting)
    `, [uuidv4(), userId, base_character, custom_name, visual_style, avatar_url, greeting]);

    res.json({ message: 'Guide configuration saved' });
  } catch (error) {
    console.error('Error saving guide:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student's enrolled courses (My Courses)
router.get('/my-courses', async (req, res) => {
  try {
    const userId = req.user.id;
    const [enrollments] = await pool.query(`
      SELECT e.*, c.title, c.thumbnail_url, c.slug, c.description,
             u.name as instructor_name,
             (SELECT payment_status FROM invoices i WHERE i.student_id = e.student_id AND i.course_id = e.course_id ORDER BY created_at DESC LIMIT 1) as payment_status,
             (SELECT COUNT(*) FROM course_lessons cl 
              JOIN course_sections cs ON cl.section_id = cs.id 
              WHERE cs.course_id = c.id) as total_lessons,
             (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id = e.id AND lp.completed = TRUE) as completed_lessons,
             EXISTS(SELECT 1 FROM exams ex WHERE ex.course_id = c.id) as has_exam,
             EXISTS(SELECT 1 FROM exam_attempts ea JOIN exams ex ON ea.exam_id = ex.id WHERE ex.course_id = c.id AND ea.student_id = e.student_id AND ea.passed = TRUE) as passed_exam
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.tutor_id = u.id
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `, [userId]);
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's job applications
router.get('/applications', async (req, res) => {
  try {
    const userId = req.user.id;
    const [applications] = await pool.query(`
      SELECT ja.*, j.title as job_title, j.company as job_company, j.location as job_location, j.type as job_type
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.student_id = ?
      ORDER BY ja.applied_at DESC
    `, [userId]);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assignment details and submission
router.get('/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [assignments] = await pool.query('SELECT * FROM assignments WHERE id = ?', [id]);
    if (assignments.length === 0) return res.status(404).json({ message: 'Assignment not found' });

    const [submissions] = await pool.query(
      'SELECT * FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?',
      [id, userId]
    );

    res.json({
      assignment: assignments[0],
      submission: submissions[0] || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit assignment
router.post('/assignments/submit', async (req, res) => {
  try {
    const { assignment_id, submission_url } = req.body;
    const userId = req.user.id;

    await pool.query(`
      INSERT INTO assignment_submissions (id, assignment_id, student_id, submission_url)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        submission_url = VALUES(submission_url),
        status = 'submitted',
        submitted_at = CURRENT_TIMESTAMP
    `, [uuidv4(), assignment_id, userId, submission_url]);

    // Notify Tutor
    const [tutorData] = await pool.query(
      `SELECT c.created_by, a.title FROM assignments a JOIN courses c ON a.course_id = c.id WHERE a.id = ?`,
      [assignment_id]
    );
    if (tutorData.length > 0) {
      const tutorId = tutorData[0].created_by;
      await createNotification({
        userId: tutorId,
        type: 'info',
        title: 'New Assignment Submission',
        message: `${req.user.name} has submitted the assignment "${tutorData[0].title}".`,
        link: '/dashboard/tutor/courses',
        emailNotify: false
      });
    }

    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await pool.query('SELECT name, email, phone, notification_settings FROM users WHERE id = ?', [userId]);
    const [profiles] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [userId]);
    res.json({
      ...users[0],
      profile: profiles[0] || {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Profile
router.put('/profile', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;
    const { 
      name, phone, date_of_birth, gender, address, 
      linkedin_url, github_url, portfolio_url, instagram_url, twitter_url, youtube_url, other_urls,
      skills, preferred_job_categories
    } = req.body;
    
    await connection.beginTransaction();
    
    // Update User
    await connection.query(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name, phone, userId]
    );
    
    // Update Student Profile
    await connection.query(`
      INSERT INTO student_profiles (
        user_id, date_of_birth, gender, address, skills,
        linkedin_url, github_url, portfolio_url, instagram_url, twitter_url, youtube_url, other_urls, preferred_job_categories
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        date_of_birth = VALUES(date_of_birth),
        gender = VALUES(gender),
        address = VALUES(address),
        skills = VALUES(skills),
        linkedin_url = VALUES(linkedin_url),
        github_url = VALUES(github_url),
        portfolio_url = VALUES(portfolio_url),
        instagram_url = VALUES(instagram_url),
        twitter_url = VALUES(twitter_url),
        youtube_url = VALUES(youtube_url),
        other_urls = VALUES(other_urls),
        preferred_job_categories = VALUES(preferred_job_categories)
    `, [
      userId, date_of_birth, gender, address, JSON.stringify(skills || []),
      linkedin_url, github_url, portfolio_url, instagram_url, twitter_url, youtube_url, JSON.stringify(other_urls || []),
      JSON.stringify(preferred_job_categories || [])
    ]);
    
    await connection.commit();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// Update Notification Settings
router.put('/notification-settings', async (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;
    
    await pool.query(
      'UPDATE users SET notification_settings = ? WHERE id = ?',
      [JSON.stringify(settings || {}), userId]
    );
    
    res.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change Password
router.post('/change-password', async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    const user = users[0];
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all assignments for enrolled courses
router.get('/assignments', async (req, res) => {
  try {
    const userId = req.user.id;
    const [assignments] = await pool.query(`
      SELECT a.*, c.title as course_title, c.slug as course_slug,
             s.status as submission_status, s.marks_awarded, s.feedback
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
      WHERE e.student_id = ?
      ORDER BY a.due_date ASC
    `, [userId, userId]);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all exam attempts for the student
router.get('/exam-attempts', async (req, res) => {
  try {
    const userId = req.user.id;
    const [attempts] = await pool.query(`
      SELECT ea.*, ex.title as exam_title, c.title as course_title
      FROM exam_attempts ea
      JOIN exams ex ON ea.exam_id = ex.id
      JOIN courses c ON ex.course_id = c.id
      WHERE ea.student_id = ?
      ORDER BY ea.submitted_at DESC
    `, [userId]);
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Get active social platforms
router.get('/social-platforms', async (req, res) => {
  try {
    const [platforms] = await pool.query('SELECT name, icon, color, url FROM social_platforms WHERE is_active = 1 ORDER BY created_at ASC');
    res.json(platforms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read social platform status for the student
router.get('/social-status', async (req, res) => {
  try {
    const userId = req.user.id;
    const [statusList] = await pool.query('SELECT id, platform_name, followed_status, followed_at FROM student_social_platform_status WHERE student_id = ?', [userId]);
    res.json(statusList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create/Update a social platform status
router.post('/social-status', async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform_name, followed_status } = req.body;
    
    if (!platform_name) {
      return res.status(400).json({ message: 'platform_name is required' });
    }

    const statusToSet = followed_status === 'unfollowed' ? 'unfollowed' : 'followed';

    const { v4: uuidv4 } = await import('uuid');
    const statusId = uuidv4();

    await pool.query(`
      INSERT INTO student_social_platform_status (id, student_id, platform_name, followed_status, followed_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        followed_status = VALUES(followed_status),
        followed_at = IF(VALUES(followed_status) = 'followed', CURRENT_TIMESTAMP, NULL)
    `, [statusId, userId, platform_name, statusToSet]);

    res.json({ message: 'Follow status saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a social platform status
router.delete('/social-status/:platform', async (req, res) => {
  try {
    const userId = req.user.id;
    const { platform } = req.params;
    
    await pool.query('DELETE FROM student_social_platform_status WHERE student_id = ? AND platform_name = ?', [userId, platform]);
    res.json({ message: 'Follow status removed completely' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
