import express from 'express';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const isEmployer = authorizeRoles('employer');

// Get all notifications for an employer
router.get('/', authenticateJWT, isEmployer, async (req, res) => {
  try {
    const [notifications] = await pool.query(
      `SELECT * FROM employer_notifications 
       WHERE employer_id = ? 
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateJWT, isEmployer, async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE employer_notifications SET is_read = TRUE WHERE id = ? AND employer_id = ?`,
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.post('/read-all', authenticateJWT, isEmployer, async (req, res) => {
  try {
    await pool.query(
      `UPDATE employer_notifications SET is_read = TRUE WHERE employer_id = ? AND is_read = FALSE`,
      [req.user.id]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
