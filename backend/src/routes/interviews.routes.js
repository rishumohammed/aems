import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { createNotification } from '../services/notification.service.js';

const router = express.Router();

router.use(authenticateJWT);

// Get interviews for the logged-in user (student or tutor)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query = '';
    let params = [];

    if (role === 'student') {
      query = `
        SELECT i.*, j.id as job_id, j.title as job_title, j.company as job_company, j.location as job_location
        FROM job_interviews i
        JOIN job_applications a ON i.application_id = a.id
        JOIN jobs j ON a.job_id = j.id
        WHERE a.student_id = ?
        ORDER BY i.scheduled_at ASC
      `;
      params = [userId];
    } else if (role === 'employer') {
      query = `
        SELECT i.*, j.title as job_title, u.name as applicant_name, u.email as applicant_email, a.id as application_id
        FROM job_interviews i
        JOIN job_applications a ON i.application_id = a.id
        JOIN users u ON a.student_id = u.id
        JOIN jobs j ON a.job_id = j.id
        WHERE j.posted_by = ?
        ORDER BY i.scheduled_at ASC
      `;
      params = [userId];
    } else if (role === 'tutor' || role === 'super_admin' || role === 'placement_coordinator') {
      query = `
        SELECT i.*, j.title as job_title, j.company as job_company, u.name as applicant_name, u.email as applicant_email
        FROM job_interviews i
        JOIN job_applications a ON i.application_id = a.id
        JOIN users u ON a.student_id = u.id
        JOIN jobs j ON a.job_id = j.id
        ORDER BY i.scheduled_at ASC
      `;
    }

    const [interviews] = await pool.query(query, params);
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific interview details
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let query = `
      SELECT i.*, 
             j.title as job_title, j.company as company_name, 
             u_student.name as applicant_name, u_student.email as applicant_email,
             a.status as application_status, a.applied_at,
             u.name as employer_name
      FROM job_interviews i
      JOIN job_applications a ON i.application_id = a.id
      JOIN users u_student ON a.student_id = u_student.id
      JOIN jobs j ON a.job_id = j.id
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE i.id = ?
    `;
    let params = [req.params.id];

    if (role === 'student') {
      query += ` AND a.student_id = ?`;
      params.push(userId);
    } else if (role === 'employer') {
      query += ` AND j.posted_by = ?`;
      params.push(userId);
    }

    const [interviews] = await pool.query(query, params);
    if (interviews.length === 0) return res.status(404).json({ message: 'Interview not found' });

    res.json(interviews[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create an interview
router.post('/', authorizeRoles('employer'), async (req, res) => {
  const { application_id, scheduled_at, location, meeting_link, notes, type, duration, round_name } = req.body;
  try {
    // Validate employer owns the job
    const [app] = await pool.query(
      `SELECT ja.id FROM job_applications ja JOIN jobs j ON ja.job_id = j.id WHERE ja.id = ? AND j.posted_by = ?`,
      [application_id, req.user.id]
    );
    if (!app.length) return res.status(403).json({ message: 'Unauthorized' });

    // Check for exact duplicate interview round
    const [existing] = await pool.query(
      `SELECT id FROM job_interviews WHERE application_id = ? AND round_name = ? AND scheduled_at = ?`,
      [application_id, round_name || 'Initial Interview', scheduled_at]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'An interview round with this name and time already exists for this candidate.' });
    }

    const id = uuidv4();
    
    await pool.query(
      `INSERT INTO job_interviews (id, application_id, round_name, scheduled_at, location, meeting_link, notes, type, duration, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [id, application_id, round_name || 'Initial Interview', scheduled_at, location, meeting_link, notes, type || 'Online', duration || 60]
    );

    // Notify Student
    const [appData] = await pool.query(
      `SELECT ja.student_id, j.title, j.company FROM job_applications ja JOIN jobs j ON ja.job_id = j.id WHERE ja.id = ?`,
      [application_id]
    );
    if (appData.length > 0) {
      const studentId = appData[0].student_id;
      await createNotification({
        userId: studentId,
        type: 'info',
        title: 'Interview Scheduled',
        message: `An interview for the position of ${appData[0].title} at ${appData[0].company} has been scheduled for you.`,
        link: '/dashboard/student/applications',
        emailNotify: true
      });
    }

    res.status(201).json({ message: 'Interview scheduled successfully', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update interview status
router.patch('/:id/status', authorizeRoles('employer', 'super_admin', 'placement_coordinator'), async (req, res) => {
  const { status } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE job_interviews i
       JOIN job_applications a ON i.application_id = a.id
       JOIN jobs j ON a.job_id = j.id
       SET i.status = ?
       WHERE i.id = ? AND j.posted_by = ?`,
      [status, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Interview not found' });
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit or reschedule interview
router.patch('/:id', authorizeRoles('employer'), async (req, res) => {
  const { scheduled_at, location, meeting_link, notes, type, duration, reschedule_reason } = req.body;
  try {
    const [existing] = await pool.query(
      `SELECT i.* FROM job_interviews i 
       JOIN jobs j ON i.application_id = (SELECT application_id FROM job_interviews WHERE id = ?)
       WHERE i.id = ? AND j.posted_by = ?`,
      [req.params.id, req.params.id, req.user.id]
    );

    if (existing.length === 0) return res.status(404).json({ message: 'Interview not found or unauthorized' });

    let query = 'UPDATE job_interviews SET ';
    let params = [];
    let updates = [];

    if (scheduled_at) {
      if (existing[0].scheduled_at && existing[0].scheduled_at.toISOString() !== new Date(scheduled_at).toISOString()) {
        updates.push('old_scheduled_at = ?');
        params.push(existing[0].scheduled_at);
        updates.push('status = ?');
        params.push('rescheduled');
      }
      updates.push('scheduled_at = ?');
      params.push(scheduled_at);
    }
    if (location !== undefined) { updates.push('location = ?'); params.push(location); }
    if (meeting_link !== undefined) { updates.push('meeting_link = ?'); params.push(meeting_link); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (type !== undefined) { updates.push('type = ?'); params.push(type); }
    if (duration !== undefined) { updates.push('duration = ?'); params.push(duration); }
    if (reschedule_reason !== undefined) { updates.push('reschedule_reason = ?'); params.push(reschedule_reason); }

    if (updates.length === 0) return res.json({ message: 'No changes provided' });

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(req.params.id);

    await pool.query(query, params);
    res.json({ message: 'Interview updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
