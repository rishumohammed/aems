import express from 'express';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import emailService from '../services/email.service.js';
import { createNotification } from '../services/notification.service.js';

const router = express.Router();
const isEmployer = authorizeRoles('employer');

// Get all applications for employer's jobs
router.get('/', authenticateJWT, isEmployer, async (req, res) => {
  try {
    const [applications] = await pool.query(
      `SELECT ja.*, j.title as job_title, u.name as user_name, u.email as user_email, u.phone as user_phone,
              (SELECT COUNT(*) FROM job_interviews WHERE application_id = ja.id) as interview_count
       FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       JOIN users u ON ja.student_id = u.id
       WHERE j.posted_by = ?
       ORDER BY ja.applied_at DESC`,
      [req.user.id]
    );
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single application's details
router.get('/:id', authenticateJWT, isEmployer, async (req, res) => {
  try {
    const [application] = await pool.query(
      `SELECT ja.*, j.title as job_title, u.name as user_name, u.email as user_email, u.phone as user_phone, sp.skills as student_skills, sp.linkedin_url as student_linkedin,
              (SELECT COUNT(*) FROM job_interviews WHERE application_id = ja.id) as interview_count
       FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       JOIN users u ON ja.student_id = u.id
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE ja.id = ? AND j.posted_by = ?`,
      [req.params.id, req.user.id]
    );

    if (application.length === 0) return res.status(404).json({ message: 'Application not found' });
    
    // Fetch course certificates (if any)
    const [certs] = await pool.query(
      `SELECT c.cert_number, co.title as course_title, c.issued_at
       FROM certificates c
       JOIN courses co ON c.course_id = co.id
       WHERE c.student_id = ? AND c.status = 'active'`,
      [application[0].student_id]
    );

    // Fetch enrollments (LMS progress)
    const [enrollments] = await pool.query(
      `SELECT e.id, e.completion_percentage, e.status, e.enrolled_at, c.title as course_title
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = ?`,
      [application[0].student_id]
    );

    // Fetch exam results
    const [exams] = await pool.query(
      `SELECT ea.id, ea.score, ea.passed, ea.submitted_at, ea.status, ex.title as exam_title
       FROM exam_attempts ea
       JOIN exams ex ON ea.exam_id = ex.id
       WHERE ea.student_id = ? AND ea.status IN ('finished', 'abandoned')`,
      [application[0].student_id]
    );

    // Fetch interviews related to this application
    const [interviews] = await pool.query(
      `SELECT id, round_name, scheduled_at, location, meeting_link, type, duration, status, notes
       FROM job_interviews
       WHERE application_id = ?
       ORDER BY scheduled_at ASC`,
      [req.params.id]
    );

    res.json({ 
      ...application[0], 
      certificates: certs,
      enrollments: enrollments,
      exams: exams,
      interviews: interviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status
router.patch('/:id/status', authenticateJWT, isEmployer, async (req, res) => {
  const { status } = req.body;
  if (!['applied', 'viewed', 'shortlisted', 'rejected', 'selected', 'hold', 'next_round'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       SET ja.status = ?
       WHERE ja.id = ? AND j.posted_by = ?`,
      [status, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Application not found' });

    // Handle Placements automatically when selected
    if (status === 'selected') {
      const [appDetails] = await pool.query(
        `SELECT ja.student_id, j.id as job_id, j.title as job_title, u.name as company_name, s.name as student_name, s.email as student_email
         FROM job_applications ja
         JOIN jobs j ON ja.job_id = j.id
         JOIN users u ON j.posted_by = u.id
         JOIN users s ON ja.student_id = s.id
         WHERE ja.id = ?`,
        [req.params.id]
      );

      if (appDetails.length > 0) {
        const ad = appDetails[0];

        // Ensure we don't insert duplicate placement
        const [existing] = await pool.query('SELECT id FROM job_placements WHERE application_id = ?', [req.params.id]);
        if (existing.length === 0) {
          const placementId = uuidv4();
          await pool.query(
            `INSERT INTO job_placements (id, student_id, employer_id, job_id, application_id, selection_date, status)
             VALUES (?, ?, ?, ?, ?, NOW(), 'Pending Offer')`,
            [placementId, ad.student_id, req.user.id, ad.job_id, req.params.id]
          );

          // Send in-app notification
          await createNotification({
            userId: ad.student_id,
            type: 'placement',
            title: '🎉 Congratulations! You have been selected',
            body: `You have been selected for the position of ${ad.job_title} at ${ad.company_name}.`,
            link: '/dashboard/placements'
          });

          // Send Email
          await emailService.sendPlacementEmail(
            { name: ad.student_name, email: ad.student_email },
            ad.job_title,
            ad.company_name
          );
        }
      }
    }

    res.json({ message: `Application status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
