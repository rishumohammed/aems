import express from 'express';
import { pool } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { broadcastToCourse } from '../services/notification.service.js';
import { USER_ROLES } from '@aems/shared';

const router = express.Router();

router.use(authenticateJWT);

// Get announcements for a course
router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const [announcements] = await pool.query(`
      SELECT a.*, u.name as tutor_name
      FROM course_announcements a
      JOIN users u ON a.tutor_id = u.id
      WHERE a.course_id = ?
      ORDER BY a.created_at DESC
    `, [courseId]);
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post a new announcement (Tutor only)
router.post('/:courseId', authorizeRoles(USER_ROLES.TUTOR, USER_ROLES.SUPER_ADMIN, USER_ROLES.LMS_USER), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, body } = req.body;
    const tutorId = req.user.id;
    const id = uuidv4();

    await pool.query(
      'INSERT INTO course_announcements (id, course_id, tutor_id, title, body) VALUES (?, ?, ?, ?, ?)',
      [id, courseId, tutorId, title, body]
    );

    // Broadcast notification to all enrolled students
    const [[course]] = await pool.query('SELECT title FROM courses WHERE id = ?', [courseId]);
    await broadcastToCourse(courseId, {
      title: `Announcement: ${course.title}`,
      body: title,
      link: `/learn/${courseId}?tab=announcements`,
      type: 'announcement'
    });

    res.status(201).json({ id, message: 'Announcement posted and notifications sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
