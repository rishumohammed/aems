import express from 'express';
import { pool } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateJWT } from '../middleware/auth.js';
import { createNotification } from '../services/notification.service.js';

const router = express.Router();

router.use(authenticateJWT);

// Get Q&A for a course
router.get('/courses/:id/qa', async (req, res) => {
  try {
    const { id } = req.params;
    const { filter, lessonId } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT q.*, u.name as student_name, u.role as student_role,
             (SELECT COUNT(*) FROM course_qa_replies WHERE question_id = q.id) as reply_count
      FROM course_qa q
      JOIN users u ON q.student_id = u.id
      WHERE q.course_id = ?
    `;
    const params = [id];

    if (lessonId) {
      query += ` AND q.lesson_id = ?`;
      params.push(lessonId);
    }

    if (filter === 'unanswered') {
      query += ` AND (SELECT COUNT(*) FROM course_qa_replies WHERE question_id = q.id) = 0`;
    } else if (filter === 'my') {
      query += ` AND q.student_id = ?`;
      params.push(userId);
    }

    query += ` ORDER BY q.created_at DESC`;

    const [questions] = await pool.query(query, params);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post a question
router.post('/courses/:id/qa', async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { title, body, lessonId } = req.body;
    const userId = req.user.id;
    const id = uuidv4();

    await pool.query(
      'INSERT INTO course_qa (id, course_id, student_id, lesson_id, title, body) VALUES (?, ?, ?, ?, ?, ?)',
      [id, courseId, userId, lessonId, title, body]
    );

    // Notify tutor
    const [[course]] = await pool.query('SELECT tutor_id, title FROM courses WHERE id = ?', [courseId]);
    if (course) {
      await createNotification({
        userId: course.tutor_id,
        type: 'new_qa',
        title: 'New Question in Course',
        body: `${req.user.name} asked: ${title}`,
        link: `/dashboard/tutor/courses/${courseId}/qa?question=${id}`
      });
    }

    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single question
router.get('/qa/:id', async (req, res) => {
  try {
    const [questions] = await pool.query(`
      SELECT q.*, u.name as student_name, c.title as course_title
      FROM course_qa q
      JOIN users u ON q.student_id = u.id
      JOIN courses c ON q.course_id = c.id
      WHERE q.id = ?
    `, [req.params.id]);

    if (questions.length === 0) return res.status(404).json({ message: 'Question not found' });
    res.json(questions[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get replies for a question
router.get('/qa/:questionId/replies', async (req, res) => {
  try {
    const { questionId } = req.params;
    const [replies] = await pool.query(`
      SELECT r.*, u.name as user_name, u.role as user_role
      FROM course_qa_replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.question_id = ?
      ORDER BY r.created_at ASC
    `, [questionId]);
    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post a reply
router.post('/qa/:questionId/replies', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { body, parentReplyId } = req.body;
    const userId = req.user.id;
    const id = uuidv4();

    await pool.query(
      'INSERT INTO course_qa_replies (id, question_id, user_id, body, parent_reply_id) VALUES (?, ?, ?, ?, ?)',
      [id, questionId, userId, body, parentReplyId]
    );

    // Notify question owner
    const [[question]] = await pool.query('SELECT student_id, title, course_id FROM course_qa WHERE id = ?', [questionId]);
    if (question && question.student_id !== userId) {
      await createNotification({
        userId: question.student_id,
        type: 'new_qa_reply',
        title: 'New Reply to your Question',
        body: `${req.user.name} replied to "${question.title}"`,
        link: `/dashboard/student/courses/${question.course_id}/qa?question=${questionId}`
      });
    }

    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Admin & Tutor Q&A Management ---

// Get all Q&A for Admin
router.get('/admin/qa', async (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { status, courseId } = req.query;
    let query = `
      SELECT q.*, u.name as student_name, c.title as course_title,
             (SELECT COUNT(*) FROM course_qa_replies WHERE question_id = q.id) as reply_count
      FROM course_qa q
      JOIN users u ON q.student_id = u.id
      JOIN courses c ON q.course_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (status) { query += ' AND q.status = ?'; params.push(status); }
    if (courseId) { query += ' AND q.course_id = ?'; params.push(courseId); }
    query += ' ORDER BY q.created_at DESC';

    const [questions] = await pool.query(query, params);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Q&A Stats
router.get('/admin/qa/stats', async (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM course_qa');
    const [[{ pending }]] = await pool.query('SELECT COUNT(*) as pending FROM course_qa WHERE status = "open" OR status = "pending_review"');
    const [[{ resolved }]] = await pool.query('SELECT COUNT(*) as resolved FROM course_qa WHERE status = "answered" OR status = "closed"');
    
    // Most active courses
    const [activeCourses] = await pool.query(`
      SELECT c.title, COUNT(q.id) as question_count 
      FROM courses c 
      JOIN course_qa q ON c.id = q.course_id 
      GROUP BY c.id 
      ORDER BY question_count DESC LIMIT 5
    `);

    res.json({ total, pending, resolved, activeCourses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Q&A for Tutor
router.get('/tutor/qa', async (req, res) => {
  if (req.user.role !== 'tutor') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { status, courseId } = req.query;
    let query = `
      SELECT q.*, u.name as student_name, c.title as course_title,
             (SELECT COUNT(*) FROM course_qa_replies WHERE question_id = q.id) as reply_count
      FROM course_qa q
      JOIN users u ON q.student_id = u.id
      JOIN courses c ON q.course_id = c.id
      WHERE c.tutor_id = ?
    `;
    const params = [req.user.id];
    if (status) { query += ' AND q.status = ?'; params.push(status); }
    if (courseId) { query += ' AND q.course_id = ?'; params.push(courseId); }
    query += ' ORDER BY q.created_at DESC';

    const [questions] = await pool.query(query, params);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tutor Q&A Stats
router.get('/tutor/qa/stats', async (req, res) => {
  if (req.user.role !== 'tutor') return res.status(403).json({ message: 'Forbidden' });
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM course_qa q JOIN courses c ON q.course_id = c.id WHERE c.tutor_id = ?', [req.user.id]);
    const [[{ unanswered }]] = await pool.query('SELECT COUNT(*) as unanswered FROM course_qa q JOIN courses c ON q.course_id = c.id WHERE c.tutor_id = ? AND q.status = "open"', [req.user.id]);
    const [[{ answered }]] = await pool.query('SELECT COUNT(*) as answered FROM course_qa q JOIN courses c ON q.course_id = c.id WHERE c.tutor_id = ? AND q.status IN ("answered", "closed")', [req.user.id]);
    
    // Average response time mock
    const avgResponseTime = "2 hours";

    res.json({ total, unanswered, answered, avgResponseTime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Question Status
router.put('/qa/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    if (!['open', 'answered', 'pending_review', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (req.user.role === 'student') return res.status(403).json({ message: 'Forbidden' });

    await pool.query('UPDATE course_qa SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Question (Admin)
router.delete('/qa/:id', async (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    await pool.query('DELETE FROM course_qa WHERE id = ?', [req.params.id]);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Reply (Admin)
router.delete('/qa/replies/:id', async (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    await pool.query('DELETE FROM course_qa_replies WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
