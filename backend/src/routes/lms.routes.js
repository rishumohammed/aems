import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { USER_ROLES } from '@aems/shared';
import { parseVideoUrl, fetchVideoMetadata } from '../utils/videoParser.js';
import { createNotification } from '../services/notification.service.js';

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === 'thumbnail' ? 'uploads/thumbnails' : 'uploads/resources';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Sanitizer for form data serialized "null" and "undefined" strings
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (req.body[key] === 'null' || req.body[key] === 'undefined') {
        req.body[key] = null;
      }
    }
  }
  next();
};

// Role Gates
const isTutorOrAdmin = authorizeRoles(USER_ROLES.TUTOR, USER_ROLES.SUPER_ADMIN);
const isAdmin = authorizeRoles(USER_ROLES.SUPER_ADMIN);

// --- Metadata ---

// Get active categories (for dropdowns)
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM course_categories WHERE is_active = true ORDER BY order_index ASC');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Course Metadata ---

// Get all courses (Admin/Tutor filtered)
router.get('/courses', authenticateJWT, async (req, res) => {
  try {
    let query = `
      SELECT c.*, u.name as tutor_name, u.role as tutor_role, cat.name as category_name,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count,
      (SELECT COUNT(*) FROM course_sections WHERE course_id = c.id) as chapter_count,
      (SELECT COUNT(*) FROM course_modules m JOIN course_sections s ON m.section_id = s.id WHERE s.course_id = c.id) as module_count,
      (SELECT COUNT(*) FROM course_lessons l JOIN course_sections s ON l.section_id = s.id WHERE s.course_id = c.id AND l.type = 'video') as video_count,
      (SELECT COUNT(*) FROM course_lessons l JOIN course_sections s ON l.section_id = s.id WHERE s.course_id = c.id AND l.type = 'resource') as document_count
      FROM courses c
      LEFT JOIN users u ON c.tutor_id = u.id
      LEFT JOIN course_categories cat ON c.category_id = cat.id
    `;
    const params = [];
    const conditions = [];

    if (req.user.role === USER_ROLES.TUTOR) {
      conditions.push('c.tutor_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === USER_ROLES.STUDENT) {
      conditions.push('c.status = "published"');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY c.created_at DESC';
    const [courses] = await pool.query(query, params);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tutor's students
router.get('/tutor/students', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.email, e.enrolled_at as joined_at, c.title as course_title,
      e.completion_percentage as progress,
      COALESCE(i.amount, 0) as total_amount,
      COALESCE(i.amount_paid, 0) as amount_paid,
      COALESCE(i.balance_due, 0) as remaining_amount,
      CASE
        WHEN i.amount IS NULL OR i.amount = 0 THEN 'pending'
        WHEN i.balance_due <= 0 THEN 'paid'
        WHEN i.amount_paid > 0 THEN 'partial'
        ELSE 'pending'
      END as payment_status
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN invoices i ON i.student_id = u.id AND i.course_id = c.id
      WHERE c.tutor_id = ?
      ORDER BY e.enrolled_at DESC
    `, [req.user.id]);
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tutor's earnings
router.get('/tutor/earnings', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT SUM(c.price) as total_revenue, COUNT(*) as sales_count
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.tutor_id = ? AND c.price_type = 'fixed'
    `, [req.user.id]);

    const [transactions] = await pool.query(`
      SELECT u.name as student_name, c.title as course_title, e.enrolled_at as date, c.price as amount
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE c.tutor_id = ? AND c.price_type = 'fixed'
      ORDER BY e.enrolled_at DESC
      LIMIT 10
    `, [req.user.id]);

    res.json({
      total_revenue: stats[0].total_revenue || 0,
      sales_count: stats[0].sales_count || 0,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export tutor's earnings statement
router.get('/tutor/earnings/export', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    const [transactions] = await pool.query(`
      SELECT u.name as student_name, c.title as course_title, e.enrolled_at as date, c.price as amount
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE c.tutor_id = ? AND c.price_type = 'fixed'
      ORDER BY e.enrolled_at DESC
    `, [req.user.id]);

    let csv = 'Student,Course,Date,Amount\n';
    transactions.forEach(t => {
      const formattedDate = new Date(t.date).toLocaleDateString();
      csv += `${t.student_name},"${t.course_title}",${formattedDate},${t.amount}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=earnings_statement.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get tutor's quizzes
router.get('/tutor/quizzes', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    let query = `
      SELECT q.*, c.title as course_title, 
      (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as questions_count
      FROM quizzes q
      LEFT JOIN courses c ON q.course_id = c.id
    `;
    const params = [];
    if (req.user.role !== 'super_admin') {
      query += ` WHERE c.tutor_id = ? OR q.course_id IS NULL `;
      params.push(req.user.id);
    }
    query += ` ORDER BY q.created_at DESC`;

    const [quizzes] = await pool.query(query, params);
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new quiz with questions
router.post('/tutor/quizzes', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  const { title, course_id, time_limit, passing_score, questions } = req.body;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const quizId = uuidv4();
    
    await connection.query(
      'INSERT INTO quizzes (id, course_id, title, time_limit, passing_score) VALUES (?, ?, ?, ?, ?)',
      [quizId, course_id, title, time_limit, passing_score]
    );

    if (questions && questions.length > 0) {
      for (const q of questions) {
        await connection.query(
          'INSERT INTO quiz_questions (id, quiz_id, question_text, options, correct_index) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), quizId, q.question_text || q.text, JSON.stringify(q.options), q.correct_index]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ id: quizId, message: 'Quiz created successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// Get single quiz with questions
router.get('/tutor/quizzes/:id', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    const [quizzes] = await pool.query(
      `SELECT q.*, c.title as course_title 
       FROM quizzes q 
       LEFT JOIN courses c ON q.course_id = c.id 
       WHERE q.id = ?`,
      [req.params.id]
    );

    if (quizzes.length === 0) return res.status(404).json({ message: 'Quiz not found' });

    const [questions] = await pool.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY created_at ASC',
      [req.params.id]
    );

    res.json({
      ...quizzes[0],
      questions: questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : []
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk update questions for a quiz
router.put('/tutor/quizzes/:id/questions', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  const { questions, title, time_limit, passing_score } = req.body;
  const quizId = req.params.id;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Update metadata if provided
    if (title || time_limit || passing_score) {
      await connection.query(
        'UPDATE quizzes SET title = ?, time_limit = ?, passing_score = ? WHERE id = ?',
        [title, time_limit, passing_score, quizId]
      );
    }

    // Replace questions: simple approach is delete and re-insert
    await connection.query('DELETE FROM quiz_questions WHERE quiz_id = ?', [quizId]);

    if (questions && questions.length > 0) {
      for (const q of questions) {
        await connection.query(
          'INSERT INTO quiz_questions (id, quiz_id, question_text, options, correct_index) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), quizId, q.question_text, JSON.stringify(q.options), q.correct_index]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Quiz updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// Delete quiz
router.delete('/tutor/quizzes/:id', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    // Ensure tutor owns the course the quiz belongs to
    const [check] = await pool.query(
      'SELECT q.id FROM quizzes q JOIN courses c ON q.course_id = c.id WHERE q.id = ? AND c.tutor_id = ?',
      [req.params.id, req.user.id]
    );

    if (check.length === 0) return res.status(403).json({ message: 'Forbidden or Quiz not found' });

    // Cascading delete should handle questions if foreign keys are set, but let's be explicit if not
    await pool.query('DELETE FROM quiz_questions WHERE quiz_id = ?', [req.params.id]);
    await pool.query('DELETE FROM quizzes WHERE id = ?', [req.params.id]);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single course (full details for editing)
router.get('/courses/:id', authenticateJWT, async (req, res) => {
  try {
    const [course] = await pool.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (course.length === 0) return res.status(404).json({ message: 'Course not found' });

    // Fetch Sections (Chapters) & Modules & Lessons
    const [sections] = await pool.query('SELECT * FROM course_sections WHERE course_id = ? ORDER BY order_index', [req.params.id]);
    
    for (let section of sections) {
      const [modules] = await pool.query('SELECT * FROM course_modules WHERE section_id = ? ORDER BY order_index', [section.id]);
      section.modules = modules;
      for (let module of modules) {
        const [lessons] = await pool.query('SELECT * FROM course_lessons WHERE module_id = ? ORDER BY order_index', [module.id]);
        module.lessons = lessons;
      }
    }

    // Fetch Prerequisites
    const [prereqs] = await pool.query(`
      SELECT p.prerequisite_course_id as id, c.title 
      FROM course_prerequisites p 
      JOIN courses c ON p.prerequisite_course_id = c.id 
      WHERE p.course_id = ?
    `, [req.params.id]);

    res.json({ ...course[0], sections, prerequisites: prereqs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Course
router.post('/courses', authenticateJWT, isTutorOrAdmin, upload.single('thumbnail'), sanitizeBody, async (req, res) => {
  const { title, slug, description, short_description, category_id, level, language, price_type, price } = req.body;
  const id = uuidv4();
  const tutor_id = req.user.id;
  const thumbnail_url = req.file ? `/uploads/thumbnails/${req.file.filename}` : null;

  try {
    const isApprovalRequired = req.user.role === USER_ROLES.TUTOR;
    await pool.query(
      `INSERT INTO courses (id, title, slug, description, short_description, tutor_id, category_id, level, language, price_type, price, thumbnail_url, status, approval_required) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
      [id, title, slug, description, short_description, tutor_id, category_id, level, language, price_type, price, thumbnail_url, isApprovalRequired]
    );
    res.status(201).json({ id, message: 'Course created as draft' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Course
router.put('/courses/:id', authenticateJWT, isTutorOrAdmin, upload.single('thumbnail'), sanitizeBody, async (req, res) => {
  const data = req.body;
  const courseId = req.params.id;
  
  try {
    const fields = ['title', 'slug', 'description', 'short_description', 'category_id', 'level', 'language', 'price_type', 'price', 'intro_video_source', 'intro_video_id', 'is_featured'];
    let updateStr = fields.filter(f => data[f] !== undefined).map(f => `${f} = ?`).join(', ');
    let values = fields.filter(f => data[f] !== undefined).map(f => data[f]);

    if (req.file) {
      updateStr += (updateStr ? ', ' : '') + 'thumbnail_url = ?';
      values.push(`/uploads/thumbnails/${req.file.filename}`);
    }

    if (updateStr) {
      await pool.query(`UPDATE courses SET ${updateStr} WHERE id = ?`, [...values, courseId]);
    }

    // Update Prerequisites if provided
    if (data.prerequisites) {
      const prereqIds = JSON.parse(data.prerequisites);
      await pool.query('DELETE FROM course_prerequisites WHERE course_id = ?', [courseId]);
      for (const pid of prereqIds) {
        await pool.query('INSERT INTO course_prerequisites (course_id, prerequisite_course_id) VALUES (?, ?)', [courseId, pid]);
      }
    }

    res.json({ message: 'Course updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change Status
router.put('/courses/:id/status', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  const { status, rejection_reason } = req.body;
  
  // Tutors can only set to draft or pending_review
  if (req.user.role === USER_ROLES.TUTOR && !['draft', 'pending_review'].includes(status)) {
    return res.status(403).json({ message: 'Tutors can only set status to Draft or Pending Review' });
  }

  if (['published', 'pending_review'].includes(status)) {
    try {
      const [chapters] = await pool.query('SELECT COUNT(*) as count FROM course_sections WHERE course_id = ?', [req.params.id]);
      if (chapters[0].count === 0) {
        return res.status(400).json({ message: 'Validation failed: A course must have at least one chapter before it can be published or submitted for review.' });
      }

      const [modules] = await pool.query(
        'SELECT COUNT(*) as count FROM course_modules WHERE section_id IN (SELECT id FROM course_sections WHERE course_id = ?)',
        [req.params.id]
      );
      if (modules[0].count === 0) {
        return res.status(400).json({ message: 'Validation failed: A course must have at least one module before it can be published or submitted for review.' });
      }

      const [lessons] = await pool.query(
        'SELECT COUNT(*) as count FROM course_lessons WHERE section_id IN (SELECT id FROM course_sections WHERE course_id = ?)',
        [req.params.id]
      );
      if (lessons[0].count === 0) {
        return res.status(400).json({ message: 'Validation failed: A course must have at least one lesson before it can be published or submitted for review.' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    if (status === 'published' && req.user.role === USER_ROLES.SUPER_ADMIN) {
      await pool.query(
        'UPDATE courses SET status = ?, rejection_reason = ?, published_at = NOW(), approved_by = ?, approval_required = false WHERE id = ?', 
        [status, rejection_reason || null, req.user.id, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE courses SET status = ?, rejection_reason = ? WHERE id = ?', 
        [status, rejection_reason || null, req.params.id]
      );
    }

    if (status === 'pending_review') {
      const [courseData] = await pool.query('SELECT title, tutor_id FROM courses WHERE id = ?', [req.params.id]);
      if (courseData.length > 0) {
        const [admins] = await pool.query('SELECT id FROM users WHERE role = "super_admin" AND status = "active"');
        for (const admin of admins) {
          await createNotification({
            userId: admin.id,
            type: 'info',
            title: 'Course Pending Approval',
            message: `The course "${courseData[0].title}" has been submitted for review.`,
            link: `/dashboard/admin/courses`,
            emailNotify: false
          });
        }
      }
    }

    res.json({ message: `Course status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Curriculum (Sections & Lessons) ---

// Add Section
router.post('/courses/:id/sections', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  const { title } = req.body;
  const course_id = req.params.id;
  const id = uuidv4();
  try {
    const [maxOrder] = await pool.query('SELECT MAX(order_index) as max_order FROM course_sections WHERE course_id = ?', [course_id]);
    const nextOrder = (maxOrder[0].max_order || 0) + 1;

    await pool.query('INSERT INTO course_sections (id, course_id, title, order_index) VALUES (?, ?, ?, ?)', [id, course_id, title, nextOrder]);
    res.status(201).json({ id, message: 'Section added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Section
router.put('/courses/:id/sections/:sid', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  const { title, description } = req.body;
  try {
    await pool.query('UPDATE course_sections SET title = ?, description = ? WHERE id = ?', [title, description || null, req.params.sid]);
    res.json({ message: 'Section updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Section
router.delete('/courses/:id/sections/:sid', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM course_sections WHERE id = ?', [req.params.sid]);
    res.json({ message: 'Section and its modules/lessons deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Modules ---

// Add Module
router.post('/courses/:id/sections/:sid/modules', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  const { title, description } = req.body;
  const section_id = req.params.sid;
  const id = uuidv4();
  try {
    const [maxOrder] = await pool.query('SELECT MAX(order_index) as max_order FROM course_modules WHERE section_id = ?', [section_id]);
    const nextOrder = (maxOrder[0].max_order || 0) + 1;

    await pool.query(
      'INSERT INTO course_modules (id, section_id, title, description, order_index) VALUES (?, ?, ?, ?, ?)',
      [id, section_id, title || 'New Module', description || null, nextOrder]
    );
    res.status(201).json({ id, message: 'Module added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Module
router.put('/courses/:id/sections/:sid/modules/:mid', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  const { title, description } = req.body;
  try {
    await pool.query(
      'UPDATE course_modules SET title = ?, description = ? WHERE id = ?',
      [title, description || null, req.params.mid]
    );
    res.json({ message: 'Module updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Module
router.delete('/courses/:id/sections/:sid/modules/:mid', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM course_modules WHERE id = ?', [req.params.mid]);
    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Lessons under Modules ---

// Add Lesson
router.post('/courses/:id/sections/:sid/modules/:mid/lessons', authenticateJWT, isTutorOrAdmin, upload.single('resource'), sanitizeBody, async (req, res) => {
  const { title, type, video_source, video_id, notes, is_free_preview, live_date, live_time, zoom_link, thumbnail_url, duration_seconds, quiz_id, assignment_id, content_html, is_mandatory, scheduled_at, duration_minutes, live_link } = req.body;
  const section_id = req.params.sid;
  const module_id = req.params.mid;
  const id = uuidv4();
  const resource_url = req.file ? `/uploads/resources/${req.file.filename}` : null;

  try {
    const [maxOrder] = await pool.query('SELECT MAX(order_index) as max_order FROM course_lessons WHERE module_id = ?', [module_id]);
    const nextOrder = (maxOrder[0].max_order || 0) + 1;

    await pool.query(
      `INSERT INTO course_lessons (id, section_id, module_id, title, type, video_source, video_id, notes, is_free_preview, order_index, resource_url, live_date, live_time, zoom_link, thumbnail_url, duration_seconds, quiz_id, assignment_id, content_html, is_mandatory, scheduled_at, duration_minutes, live_link) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, section_id, module_id, title, type,
        video_source || null, video_id || null, notes || null,
        is_free_preview === 'true' || is_free_preview === true, nextOrder, resource_url,
        live_date || null, live_time || null, zoom_link || null,
        thumbnail_url || null, parseInt(duration_seconds || 0),
        quiz_id || null, assignment_id || null, content_html || null,
        is_mandatory === undefined ? true : (is_mandatory === 'true' || is_mandatory === true),
        scheduled_at || null, parseInt(duration_minutes || 60), live_link || null
      ]
    );
    res.status(201).json({ id, message: 'Lesson added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Lesson
router.put('/courses/:id/sections/:sid/modules/:mid/lessons/:lid', authenticateJWT, isTutorOrAdmin, upload.single('resource'), sanitizeBody, async (req, res) => {
  const { title, type, video_source, video_id, notes, is_free_preview, live_date, live_time, zoom_link, thumbnail_url, duration_seconds, quiz_id, assignment_id, content_html, is_mandatory, scheduled_at, duration_minutes, live_link } = req.body;
  const lesson_id = req.params.lid;
  const resource_url = req.file ? `/uploads/resources/${req.file.filename}` : undefined;

  try {
    const fields = ['title', 'type', 'video_source', 'video_id', 'notes', 'is_free_preview', 'live_date', 'live_time', 'zoom_link', 'thumbnail_url', 'duration_seconds', 'quiz_id', 'assignment_id', 'content_html', 'is_mandatory', 'scheduled_at', 'duration_minutes', 'live_link'];
    let updateStr = fields.filter(f => req.body[f] !== undefined).map(f => `${f} = ?`).join(', ');
    let values = fields.filter(f => req.body[f] !== undefined).map(f => {
      if (f === 'is_free_preview') return req.body[f] === 'true' || req.body[f] === true;
      if (f === 'is_mandatory') return req.body[f] === 'true' || req.body[f] === true;
      if (f === 'duration_seconds') return parseInt(req.body[f] || 0);
      if (f === 'duration_minutes') return parseInt(req.body[f] || 60);
      return req.body[f];
    });

    if (resource_url !== undefined) {
      updateStr += (updateStr ? ', ' : '') + 'resource_url = ?';
      values.push(resource_url);
    }

    if (updateStr) {
      await pool.query(`UPDATE course_lessons SET ${updateStr} WHERE id = ?`, [...values, lesson_id]);
    }
    res.json({ message: 'Lesson updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Lesson
router.delete('/courses/:id/sections/:sid/modules/:mid/lessons/:lid', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM course_lessons WHERE id = ?', [req.params.lid]);
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reorder Curriculum
router.put('/curriculum/reorder', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  const { type, items } = req.body; // type: 'sections' | 'modules' | 'lessons', items: [{id, order_index, [parent_id]}]
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    for (const item of items) {
      if (type === 'lessons') {
        await connection.query(
          `UPDATE course_lessons SET order_index = ?, module_id = ?, section_id = ? WHERE id = ?`,
          [item.order_index, item.module_id, item.section_id, item.id]
        );
      } else if (type === 'modules') {
        await connection.query(
          `UPDATE course_modules SET order_index = ?, section_id = ? WHERE id = ?`,
          [item.order_index, item.section_id, item.id]
        );
      } else {
        await connection.query(
          `UPDATE course_sections SET order_index = ? WHERE id = ?`,
          [item.order_index, item.id]
        );
      }
    }
    await connection.commit();
    res.json({ message: 'Order updated' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// Get assignments for a course
router.get('/courses/:id/assignments', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  try {
    const [assignments] = await pool.query(
      'SELECT * FROM assignments WHERE course_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Utilities ---

// Parse Video URL
router.post('/parse-video-url', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  const { url } = req.body;
  const parsed = parseVideoUrl(url);
  if (!parsed) return res.status(400).json({ message: 'Invalid video URL' });

  const metadata = await fetchVideoMetadata(parsed.source, parsed.id);
  res.json({ ...parsed, ...metadata });
});
// Add recording to live session
router.put('/lessons/:lid/recording', authenticateJWT, isTutorOrAdmin, async (req, res) => {
  const { url } = req.body;
  const parsed = parseVideoUrl(url);
  
  if (!parsed) {
    return res.status(400).json({ message: 'Invalid video URL' });
  }

  try {
    const metadata = await fetchVideoMetadata(parsed.source, parsed.id);
    
    await pool.query(
      `UPDATE course_lessons 
       SET type = 'video', 
           video_source = ?, 
           video_id = ?, 
           thumbnail_url = ?, 
           duration_seconds = ? 
       WHERE id = ?`,
      [parsed.source, parsed.id, metadata?.thumbnail_url || null, metadata?.duration || 0, req.params.lid]
    );

    res.json({ message: 'Recording added and session converted to video' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
