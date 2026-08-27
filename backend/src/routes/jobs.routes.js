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
      SELECT j.*, jc.name as category_name, jc.icon as category_icon, jc.slug as category_slug, 
             u.name as employer_name, u.role as poster_role,
             ep.logo_url as employer_logo, ep.about_company as employer_bio, ep.website as employer_website
      FROM jobs j
      LEFT JOIN job_categories jc ON j.category = jc.id
      LEFT JOIN users u ON j.posted_by = u.id
      LEFT JOIN employer_profiles ep ON (u.id = ep.user_id AND u.role = 'employer')
      WHERE j.status = 'approved'
      ORDER BY j.created_at DESC
    `);

    const formattedJobs = jobs.map(job => {
      let finalCompany = job.company;
      if (job.poster_role !== 'employer' && finalCompany === 'Brixify') {
        finalCompany = null;
      }
      if (job.hide_company_name) {
        return {
          ...job,
          company: 'Confidential Organization',
          company_logo: null,
          company_bio: null,
          company_website: null
        };
      }
      if (job.poster_role === 'employer') {
        return {
          ...job,
          company: finalCompany,
          company_logo: job.employer_logo || null,
          company_bio: job.employer_bio || null,
          company_website: job.employer_website || null
        };
      }
      return {
        ...job,
        company: finalCompany,
        company_logo: null,
        company_bio: null,
        company_website: null
      };
    });

    res.json(formattedJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Fetch single public job
router.get('/:id', async (req, res) => {
  try {
    const [jobs] = await pool.query(`
      SELECT j.*, jc.name as category_name, jc.icon as category_icon, 
             u.name as employer_name, u.role as poster_role,
             ep.logo_url as employer_logo, ep.about_company as employer_bio, ep.website as employer_website
      FROM jobs j
      LEFT JOIN job_categories jc ON j.category = jc.id
      LEFT JOIN users u ON j.posted_by = u.id
      LEFT JOIN employer_profiles ep ON (u.id = ep.user_id AND u.role = 'employer')
      WHERE j.id = ? AND j.status = 'approved'
    `, [req.params.id]);
    
    if (jobs.length === 0) return res.status(404).json({ message: 'Job posting not found or is no longer active' });
    
    const job = jobs[0];
    let finalCompany = job.company;
    if (job.poster_role !== 'employer' && finalCompany === 'Brixify') {
      finalCompany = null;
    }

    if (job.hide_company_name) {
      job.company = 'Confidential Organization';
      job.company_logo = null;
      job.company_bio = null;
      job.company_website = null;
    } else if (job.poster_role === 'employer') {
      job.company = finalCompany;
      job.company_logo = job.employer_logo || null;
      job.company_bio = job.employer_bio || null;
      job.company_website = job.employer_website || null;
    } else {
      job.company = finalCompany;
      job.company_logo = null;
      job.company_bio = null;
      job.company_website = null;
    }

    res.json(job);
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

// 4. Check if Student Applied
router.get('/:id/check-application', authenticateJWT, authorizeRoles('student'), async (req, res) => {
  try {
    const [existing] = await pool.query("SELECT id FROM job_applications WHERE job_id = ? AND student_id = ?", [req.params.id, req.user.id]);
    res.json({ hasApplied: existing.length > 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
