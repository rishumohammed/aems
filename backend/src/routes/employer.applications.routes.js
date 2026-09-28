import express from 'express';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import emailService from '../services/email.service.js';
import { createNotification } from '../services/notification.service.js';
import { calculateJobMatch } from '../services/jobMatching.service.js';

const router = express.Router();
const isEmployer = authorizeRoles('employer');

// Get all applications for employer's jobs
router.get('/', authenticateJWT, isEmployer, async (req, res) => {
  try {
    const { gender, qualification, joining_status, job_id, match_status } = req.query;
    let query = `
      SELECT ja.*, 
             j.title as job_title, j.requirements_json, j.qualification_req, j.experience_level, 
             j.specialization_req, j.gender_preference, j.language_req, j.joining_status_req,
             u.name as user_name, u.email as user_email, u.phone as user_phone,
             (SELECT COUNT(*) FROM certificates c WHERE c.student_id = ja.student_id AND c.status = 'active') as certs_active,
             (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = ja.student_id AND e.status = 'completed') as courses_completed,
             (SELECT COUNT(*) FROM job_interviews WHERE application_id = ja.id) as interview_count
       FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       JOIN users u ON ja.student_id = u.id
       WHERE j.posted_by = ?`;
    const params = [req.user.id];

    if (job_id) {
      query += ` AND ja.job_id = ?`;
      params.push(job_id);
    }
    if (gender) {
      query += ` AND ja.applicant_gender = ?`;
      params.push(gender);
    }
    if (qualification) {
      query += ` AND ja.qualification = ?`;
      params.push(qualification);
    }
    if (joining_status) {
      query += ` AND ja.joining_status = ?`;
      params.push(joining_status);
    }

    query += ` ORDER BY ja.applied_at DESC`;

    const [applications] = await pool.query(query, params);

    // Compute match score and breakdown for each application
    const scoredApplications = applications.map(app => {
      const match = calculateJobMatch({
        requirements_json: app.requirements_json,
        qualification_req: app.qualification_req,
        experience_level: app.experience_level,
        specialization_req: app.specialization_req,
        gender_preference: app.gender_preference,
        language_req: app.language_req,
        joining_status_req: app.joining_status_req
      }, {
        skills: app.skills_json,
        experience_years: app.experience_years,
        qualification: app.qualification,
        field_of_study: app.field_of_study,
        gender: app.applicant_gender,
        language_proficiency: app.language_proficiency,
        joining_status: app.joining_status,
        certs_active: app.certs_active,
        courses_completed: app.courses_completed
      });

      return {
        ...app,
        matchScore: match.matchScore,
        isMatch: match.isMatch,
        criteriaBreakdown: match.criteriaBreakdown,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills
      };
    });

    let result = scoredApplications;
    if (match_status === 'matched') {
      result = scoredApplications.filter(a => a.isMatch);
    } else if (match_status === 'unmatched') {
      result = scoredApplications.filter(a => !a.isMatch);
    }

    // Default sort: highest match score first, then newest
    result.sort((a, b) => b.matchScore - a.matchScore || new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());

    res.json(result);
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
