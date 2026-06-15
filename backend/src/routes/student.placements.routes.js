import express from 'express';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateJWT, authorizeRoles('student'), async (req, res) => {
  try {
    const [placements] = await pool.query(
      `SELECT p.*, 
              j.title as job_title, 
              j.company as job_company,
              j.location as job_location
       FROM job_placements p
       JOIN jobs j ON p.job_id = j.id
       WHERE p.student_id = ?
       ORDER BY p.selection_date DESC`,
      [req.user.id]
    );

    res.json(placements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
