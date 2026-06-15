import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import emailService from '../services/email.service.js';

const router = express.Router();
const isAdmin = authorizeRoles('super_admin', 'tutor');

// ────────────────────────────────────────────────────────────────────────────────
// JOB CATEGORIES
// ────────────────────────────────────────────────────────────────────────────────
router.get('/job-categories', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT jc.*, COUNT(j.id) as active_job_count 
      FROM job_categories jc 
      LEFT JOIN jobs j ON jc.id = j.category AND j.status = 'approved'
      GROUP BY jc.id
      ORDER BY jc.name ASC
    `);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/job-categories', authenticateJWT, isAdmin, async (req, res) => {
  const { name, slug, icon } = req.body;
  try {
    const id = uuidv4();
    await pool.query(
      'INSERT INTO job_categories (id, name, slug, icon) VALUES (?, ?, ?, ?)',
      [id, name, slug, icon]
    );
    res.status(201).json({ id, name, slug, icon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/job-categories/:id', authenticateJWT, isAdmin, async (req, res) => {
  const { name, slug, icon, is_active } = req.body;
  try {
    await pool.query(
      'UPDATE job_categories SET name=?, slug=?, icon=?, is_active=? WHERE id=?',
      [name, slug, icon, is_active ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/job-categories/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM job_categories WHERE id=?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// JOBS APPROVAL & MANAGEMENT
// ────────────────────────────────────────────────────────────────────────────────
router.get('/jobs', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const status = req.query.status;
    let query = `
      SELECT j.*, jc.name as category_name, jc.slug as category_slug, u.name as employer_name, u.email as employer_email,
             (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as applicant_count
      FROM jobs j
      LEFT JOIN job_categories jc ON j.category = jc.id
      LEFT JOIN users u ON j.posted_by = u.id
    `;
    const params = [];
    if (status && status !== 'all') {
      query += ` WHERE j.status = ?`;
      params.push(status);
    }
    query += ` ORDER BY j.created_at DESC`;

    const [jobs] = await pool.query(query, params);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch only jobs pending approval
router.get('/job-approvals', authenticateJWT, isAdmin, async (req, res) => {
  try {
    let query = `
      SELECT j.*, jc.name as category_name, jc.slug as category_slug, 
             u.name as employer_name, u.email as employer_email, ep.company_name
      FROM jobs j
      LEFT JOIN job_categories jc ON j.category = jc.id
      LEFT JOIN users u ON j.posted_by = u.id
      LEFT JOIN employer_profiles ep ON ep.user_id = u.id
      WHERE j.status = 'pending_approval'
      ORDER BY j.created_at ASC
    `;
    const [jobs] = await pool.query(query);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/jobs', authenticateJWT, isAdmin, async (req, res) => {
  const { title, company, category_id, location, is_remote, type, salary_range, description, required_skills, nice_to_have_skills, deadline, apply_url } = req.body;
  try {
    const jobId = uuidv4();
    const requirements = JSON.stringify({ required: required_skills || [], nice_to_have: nice_to_have_skills || [] });
    
    const status = req.user.role === 'super_admin' ? 'approved' : 'pending_approval';
    
    await pool.query(
      `INSERT INTO jobs (id, title, company, category, location, is_remote, type, salary_range, description, requirements_json, deadline, apply_url, posted_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [jobId, title, company || 'AEMS Academy', category_id, location, is_remote ? 1 : 0, type, salary_range, description, requirements, deadline || null, apply_url, req.user.id, status]
    );

    res.status(201).json({ message: status === 'approved' ? 'Job published' : 'Job submitted for review', jobId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/jobs/:id/approve', authenticateJWT, isAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE jobs SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?", [req.user.id, req.params.id]);
    
    // Optionally fetch employer email and notify
    const [jobs] = await pool.query('SELECT j.title, u.email, u.name FROM jobs j JOIN users u ON j.posted_by = u.id WHERE j.id = ?', [req.params.id]);
    if (jobs.length > 0 && jobs[0].email) {
      emailService.sendEmail({
        to: jobs[0].email,
        subject: `✅ Your Job Listing is Live: ${jobs[0].title}`,
        html: `<p>Hello ${jobs[0].name},</p><p>Your job listing for <strong>${jobs[0].title}</strong> has been approved and is now live on our board.</p>`
      }).catch(e => console.log('Email error:', e.message));
    }

    res.json({ message: 'Job approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/jobs/:id/reject', authenticateJWT, isAdmin, async (req, res) => {
  const { reason } = req.body;
  try {
    await pool.query("UPDATE jobs SET status = 'rejected', rejection_reason = ? WHERE id = ?", [reason || 'No reason provided', req.params.id]);
    
    // Notify employer
    const [jobs] = await pool.query('SELECT j.title, u.email, u.name FROM jobs j JOIN users u ON j.posted_by = u.id WHERE j.id = ?', [req.params.id]);
    if (jobs.length > 0 && jobs[0].email) {
      emailService.sendEmail({
        to: jobs[0].email,
        subject: `❌ Your Job Listing requires revisions: ${jobs[0].title}`,
        html: `<p>Hello ${jobs[0].name},</p><p>Your job listing for <strong>${jobs[0].title}</strong> could not be approved.</p><p><strong>Reason:</strong> ${reason}</p><p>Please edit your draft and resubmit.</p>`
      }).catch(e => console.log('Email error:', e.message));
    }

    res.json({ message: 'Job rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// APPLICANTS PER JOB
// ────────────────────────────────────────────────────────────────────────────────
router.get('/jobs/:id/applicants', authenticateJWT, isAdmin, async (req, res) => {
  try {
    // Basic job details
    const [jobs] = await pool.query('SELECT title, company, location FROM jobs WHERE id = ?', [req.params.id]);
    
    // Applicants with student info
    const [applicants] = await pool.query(`
      SELECT ja.*, 
             u.name as fallback_name, u.email as fallback_email, up.avatar_url,
             (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = ja.student_id AND e.status = 'completed') as courses_completed,
             (SELECT COUNT(*) FROM certificates c WHERE c.student_id = ja.student_id AND c.status = 'active') as certs_active
      FROM job_applications ja
      JOIN users u ON ja.student_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE ja.job_id = ?
      ORDER BY ja.applied_at DESC
    `, [req.params.id]);

    res.json({ job: jobs[0], applicants });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/job-applications/:id/status', authenticateJWT, isAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE job_applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Application status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/jobs/:id', authenticateJWT, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
