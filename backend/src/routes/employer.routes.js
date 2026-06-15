import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// 1. Employer Registration (Public)
router.post('/register', async (req, res) => {
  const { 
    company_name, contact_name, email, phone, website, industry, description, password,
    employer_role, company_size, address, logo_url, linkedin_url
  } = req.body;
  
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create user with status = active (employer_profiles.approval_status handles approval state)
    await pool.query(
      `INSERT INTO users (id, name, email, phone, password_hash, role, status) 
       VALUES (?, ?, ?, ?, ?, 'employer', 'active')`,
      [userId, contact_name || company_name, email, phone, hashedPassword]
    );

    // Create employer profile
    await pool.query(
      `INSERT INTO employer_profiles 
       (user_id, employer_role, company_name, company_size, industry, address, logo_url, about_company, website, linkedin_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        employer_role || 'employer', 
        company_name, 
        company_size || null, 
        industry || null, 
        address || null, 
        logo_url || null, 
        description || null, 
        website || null, 
        linkedin_url || null
      ]
    );

    res.status(201).json({ message: 'Registration successful. Awaiting admin verification.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// AUTHENTICATED EMPLOYER ROUTES
// ────────────────────────────────────────────────────────────────────────────────
const isEmployer = authorizeRoles('employer');

router.post('/jobs', authenticateJWT, isEmployer, async (req, res) => {
  const { 
    title, category_id, location, is_remote, type, salary_range, description, 
    required_skills, nice_to_have_skills, experience_level, number_of_openings, deadline, apply_url,
    action
  } = req.body;
  
  try {
    // Check if user is verified (approved)
    const [profiles] = await pool.query("SELECT company_name, approval_status FROM employer_profiles WHERE user_id = ?", [req.user.id]);
    if (!profiles.length || profiles[0].approval_status !== 'approved') {
      const message = profiles[0]?.approval_status === 'pending_approval' 
        ? 'Your account is pending verification by an admin.' 
        : 'Your account is not approved for job posting. Please contact support.';
      return res.status(403).json({ message });
    }

    const company = profiles[0].company_name || 'Unknown Company';

    const jobId = uuidv4();
    const requirements = JSON.stringify({ 
      required: required_skills || [], 
      nice_to_have: nice_to_have_skills || [],
      experience_level: experience_level || '',
      number_of_openings: number_of_openings || 1
    });

    const status = action === 'submit' ? 'pending_approval' : 'draft';

    await pool.query(
      `INSERT INTO jobs (id, title, company, category, location, is_remote, type, salary_range, description, requirements_json, deadline, apply_url, posted_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [jobId, title, company, category_id, location, is_remote ? 1 : 0, type, salary_range, description, requirements, deadline || null, apply_url, req.user.id, status]
    );

    res.status(201).json({ message: status === 'pending_approval' ? 'Job submitted for review' : 'Job saved as draft', jobId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Edit Job (Draft, Pending, or Rejected)
router.put('/jobs/:id', authenticateJWT, isEmployer, async (req, res) => {
  const { 
    title, category_id, location, is_remote, type, salary_range, description, 
    required_skills, nice_to_have_skills, experience_level, number_of_openings, deadline, apply_url,
    action
  } = req.body;
  try {
    const requirements = JSON.stringify({ 
      required: required_skills || [], 
      nice_to_have: nice_to_have_skills || [],
      experience_level: experience_level || '',
      number_of_openings: number_of_openings || 1
    });
    
    // Allow edit if status is draft, pending_approval, or rejected
    const [existingJobs] = await pool.query('SELECT status FROM jobs WHERE id = ? AND posted_by = ?', [req.params.id, req.user.id]);
    if (existingJobs.length === 0) return res.status(404).json({ message: 'Job not found' });
    
    const currentStatus = existingJobs[0].status;
    if (['approved', 'closed'].includes(currentStatus)) {
      return res.status(403).json({ message: 'Cannot edit approved or closed jobs' });
    }

    const newStatus = action === 'submit' ? 'pending_approval' : currentStatus;

    const [result] = await pool.query(
      `UPDATE jobs SET title=?, category=?, location=?, is_remote=?, type=?, salary_range=?, description=?, requirements_json=?, deadline=?, apply_url=?, status=?
       WHERE id=? AND posted_by=?`,
      [title, category_id, location, is_remote ? 1 : 0, type, salary_range, description, requirements, deadline || null, apply_url, newStatus, req.params.id, req.user.id]
    );

    res.json({ message: newStatus === 'pending_approval' ? 'Job resubmitted for review' : 'Job updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit a Draft or Rejected job for approval explicitly without editing
router.patch('/jobs/:id/submit-approval', authenticateJWT, isEmployer, async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE jobs SET status = 'pending_approval' WHERE id = ? AND posted_by = ? AND status IN ('draft', 'rejected')",
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Job not found or not eligible for submission' });
    res.json({ message: 'Job submitted for admin review.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Get Employer's Own Jobs
router.get('/jobs', authenticateJWT, isEmployer, async (req, res) => {
  try {
    const [jobs] = await pool.query(
      `SELECT j.*, jc.name as category_name 
       FROM jobs j 
       LEFT JOIN job_categories jc ON j.category = jc.id 
       WHERE j.posted_by = ? ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single job for editing
router.get('/jobs/:id', authenticateJWT, isEmployer, async (req, res) => {
  try {
    const [jobs] = await pool.query(
      `SELECT * FROM jobs WHERE id = ? AND posted_by = ?`,
      [req.params.id, req.user.id]
    );
    if (jobs.length === 0) return res.status(404).json({ message: 'Job not found' });
    res.json(jobs[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Employer Profile
router.get('/profile', authenticateJWT, isEmployer, async (req, res) => {
  try {
    const [profiles] = await pool.query("SELECT * FROM employer_profiles WHERE user_id = ?", [req.user.id]);
    if (!profiles.length) return res.status(404).json({ message: 'Profile not found' });
    res.json(profiles[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Employer Profile
router.put('/profile', authenticateJWT, isEmployer, async (req, res) => {
  const { 
    company_name, company_size, industry, address, logo_url, about_company, website, 
    linkedin_url, social_links_json, hiring_locations_json, benefits_json 
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE employer_profiles 
       SET company_name=?, company_size=?, industry=?, address=?, logo_url=?, about_company=?, website=?, 
           linkedin_url=?, social_links_json=?, hiring_locations_json=?, benefits_json=?
       WHERE user_id=?`,
      [
        company_name, company_size, industry, address, logo_url, about_company, website,
        linkedin_url, JSON.stringify(social_links_json || []), JSON.stringify(hiring_locations_json || []), JSON.stringify(benefits_json || []), req.user.id
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Profile not found' });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Get Employer Stats
router.get('/stats', authenticateJWT, isEmployer, async (req, res) => {
  try {
    const employerId = req.user.id;

    // 1. Total applications for jobs posted by this employer
    const [[{ totalApplications }]] = await pool.query(
      `SELECT COUNT(*) as totalApplications
       FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       WHERE j.posted_by = ?`,
      [employerId]
    );

    // 2. Interviews scheduled for jobs posted by this employer
    const [[{ interviewsScheduled }]] = await pool.query(
      `SELECT COUNT(*) as interviewsScheduled
       FROM job_interviews i
       JOIN job_applications ja ON i.application_id = ja.id
       JOIN jobs j ON ja.job_id = j.id
       WHERE j.posted_by = ?`,
      [employerId]
    );

    // 3. Shortlisted candidates (representing hires made)
    const [[{ hiresMade }]] = await pool.query(
      `SELECT COUNT(*) as hiresMade
       FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       WHERE j.posted_by = ? AND ja.status = 'shortlisted'`,
      [employerId]
    );

    res.json({
      totalApplications,
      interviewsScheduled,
      hiresMade
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

