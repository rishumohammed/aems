import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { createNotification } from '../services/notification.service.js';

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Multer Config for Resumes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/resumes';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `resume-${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  }
});

// 1. Fetch public active jobs
router.get('/', async (req, res) => {
  try {
    const [jobs] = await pool.query(`
      SELECT j.*, jc.name as category_name, jc.icon as category_icon, jc.slug as category_slug, u.name as employer_name, up.avatar_url as company_logo
      FROM jobs j
      LEFT JOIN job_categories jc ON j.category = jc.id
      LEFT JOIN users u ON j.posted_by = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE j.status = 'approved'
      ORDER BY j.created_at DESC
    `);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Fetch single public job
router.get('/:id', async (req, res) => {
  try {
    const [jobs] = await pool.query(`
      SELECT j.*, jc.name as category_name, jc.icon as category_icon, u.name as employer_name, up.avatar_url as company_logo, up.bio as company_bio, up.linkedin as company_website
      FROM jobs j
      LEFT JOIN job_categories jc ON j.category = jc.id
      LEFT JOIN users u ON j.posted_by = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE j.id = ? AND j.status = 'approved'
    `, [req.params.id]);
    
    if (jobs.length === 0) return res.status(404).json({ message: 'Job posting not found or is no longer active' });
    res.json(jobs[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Student Apply (with Resume Upload)
router.post('/:id/apply', authenticateJWT, authorizeRoles('student'), upload.single('resume'), async (req, res) => {
  const { 
    first_name, last_name, dob, email, phone, gender, city, linkedin,
    qualification, field_of_study, institution, year_of_passing, grade,
    employment_status, experience_years, last_company, last_role, key_skills,
    cover_note
  } = req.body;

  try {
    // 1. Validate Job
    const [jobs] = await pool.query("SELECT id FROM jobs WHERE id = ? AND status = 'approved'", [req.params.id]);
    if (jobs.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Invalid job posting or the position has been closed' });
    }

    // 2. Check Duplicate Application
    const [existing] = await pool.query("SELECT id FROM job_applications WHERE job_id = ? AND student_id = ?", [req.params.id, req.user.id]);
    if (existing.length > 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // 3. Validate Resume
    if (!req.file) {
      return res.status(400).json({ message: 'Resume is required (PDF format only)' });
    }

    const appId = uuidv4();
    const applicantName = `${first_name} ${last_name}`.trim();
    
    // Parse key_skills if it's a string from FormData
    let skillsJson = '[]';
    try {
      skillsJson = typeof key_skills === 'string' ? key_skills : JSON.stringify(key_skills || []);
    } catch (e) {}

    await pool.query(
      `INSERT INTO job_applications (
        id, job_id, student_id, applicant_name, dob, applicant_email, applicant_phone, gender, city, linkedin,
        qualification, field_of_study, institution, year_of_passing, grade, 
        experience_years, last_company, last_role, skills_json, cover_note, resume_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appId, req.params.id, req.user.id, applicantName, dob || null, email, phone, gender, city, linkedin,
        qualification, field_of_study, institution, year_of_passing || null, grade,
        parseInt(experience_years) || 0, last_company, last_role, skillsJson, cover_note, req.file.path
      ]
    );

    // Notify Employer
    const [jobData] = await pool.query('SELECT posted_by, title FROM jobs WHERE id = ?', [req.params.id]);
    if (jobData.length > 0 && jobData[0].posted_by) {
      await createNotification({
        userId: jobData[0].posted_by,
        type: 'info',
        title: 'New Job Application',
        message: `${applicantName} has applied for the position of ${jobData[0].title}.`,
        link: `/dashboard/employer/applications`,
        emailNotify: false
      });
    }

    res.status(201).json({ 
      success: true,
      message: 'Application submitted successfully', 
      applicationId: appId 
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Job Apply Error:', error);
    res.status(500).json({ message: 'Internal server error during application submission' });
  }
});

export default router;
