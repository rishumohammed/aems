import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles, requirePermission } from '../middleware/auth.js';
import emailService from '../services/email.service.js';
import { createNotification } from '../services/notification.service.js';
import { calculateJobMatch, getJobMatchedCandidates } from '../services/jobMatching.service.js';

const router = express.Router();
const hasAccess = requirePermission('jobs');

// ────────────────────────────────────────────────────────────────────────────────
// JOB CATEGORIES
// ────────────────────────────────────────────────────────────────────────────────
router.get('/job-categories', authenticateJWT, hasAccess, async (req, res) => {
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

router.post('/job-categories', authenticateJWT, hasAccess, async (req, res) => {
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

router.put('/job-categories/:id', authenticateJWT, hasAccess, async (req, res) => {
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

router.delete('/job-categories/:id', authenticateJWT, hasAccess, async (req, res) => {
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
router.get('/jobs', authenticateJWT, hasAccess, async (req, res) => {
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
router.get('/job-approvals', authenticateJWT, hasAccess, async (req, res) => {
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

router.post('/jobs', authenticateJWT, hasAccess, async (req, res) => {
  const { 
    title, company, category_id, location, is_remote, type, salary_range, description, 
    required_skills, nice_to_have_skills, experience_level, number_of_openings, deadline, apply_url, 
    hide_company_name, gender_preference, qualification_req, language_req, specialization_req, joining_status_req 
  } = req.body;

  try {
    const jobId = uuidv4();
    const requirements = JSON.stringify({ 
      required: required_skills || [], 
      nice_to_have: nice_to_have_skills || [],
      experience_level: experience_level || '',
      number_of_openings: number_of_openings || 1
    });
    
    const status = req.user.role === 'super_admin' ? 'approved' : 'pending_approval';
    const isCompanyHidden = hide_company_name ? 1 : 0;
    const defaultCompany = req.user?.name || 'Brix Certifications';
    const companyName = isCompanyHidden ? 'Confidential Organization' : (company?.trim() || defaultCompany);
    
    await pool.query(
      `INSERT INTO jobs (
        id, title, company, category, location, is_remote, type, salary_range, description, 
        requirements_json, deadline, apply_url, posted_by, status, hide_company_name,
        gender_preference, qualification_req, language_req, specialization_req, joining_status_req
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jobId, 
        title, 
        companyName, 
        category_id, 
        location || '', 
        is_remote ? 1 : 0, 
        type || 'full_time', 
        salary_range || 'Not Disclosed', 
        description || '', 
        requirements, 
        deadline || null, 
        apply_url || null, 
        req.user.id, 
        status, 
        isCompanyHidden,
        gender_preference || 'any',
        qualification_req || null,
        language_req ? (typeof language_req === 'string' ? language_req : JSON.stringify(language_req)) : null,
        specialization_req || null,
        joining_status_req || null
      ]
    );

    res.status(201).json({ message: status === 'approved' ? 'Job published successfully' : 'Job submitted for review', jobId });
  } catch (error) {
    console.error('Error posting admin job:', error);
    res.status(500).json({ message: error.message || 'Failed to post job' });
  }
});

router.put('/jobs/:id/approve', authenticateJWT, hasAccess, async (req, res) => {
  try {
    await pool.query("UPDATE jobs SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?", [req.user.id, req.params.id]);
    
    // Optionally fetch employer email and notify
    const [jobs] = await pool.query('SELECT j.title, u.email, u.name FROM jobs j JOIN users u ON j.posted_by = u.id WHERE j.id = ?', [req.params.id]);
    if (jobs.length > 0 && jobs[0].email) {
      emailService.sendEmail({
        to: jobs[0].email,
        subject: `✅ Your Job Listing is Live: ${jobs[0].title}`,
        html: `<p>Hello ${jobs[0].name},</p><p>Your job listing for <strong>${jobs[0].title}</strong> has been approved and is now live on our board.</p>`
      }).catch(e => console.log('Email error:', e?.message || e));
    }

    res.json({ message: 'Job approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/jobs/:id/reject', authenticateJWT, hasAccess, async (req, res) => {
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
      }).catch(e => console.log('Email error:', e?.message || e));
    }

    res.json({ message: 'Job rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single job for admin editing
router.get('/jobs/:id', authenticateJWT, hasAccess, async (req, res) => {
  try {
    const [jobs] = await pool.query(`
      SELECT j.*, jc.name as category_name, jc.slug as category_slug, u.name as employer_name, u.email as employer_email
      FROM jobs j
      LEFT JOIN job_categories jc ON j.category = jc.id
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE j.id = ?
    `, [req.params.id]);

    if (jobs.length === 0) return res.status(404).json({ message: 'Job not found' });
    res.json(jobs[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update job details (Admin)
router.put('/jobs/:id', authenticateJWT, hasAccess, async (req, res) => {
  const { 
    title, company, category_id, location, is_remote, type, salary_range, description, 
    required_skills, nice_to_have_skills, experience_level, number_of_openings, deadline, apply_url,
    status, gender_preference, qualification_req, language_req, specialization_req, joining_status_req,
    hide_company_name
  } = req.body;

  try {
    const requirements = JSON.stringify({ 
      required: required_skills || [], 
      nice_to_have: nice_to_have_skills || [],
      experience_level: experience_level || '',
      number_of_openings: number_of_openings || 1
    });

    const [existing] = await pool.query('SELECT id FROM jobs WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Job not found' });

    const isCompanyHidden = hide_company_name ? 1 : 0;
    const companyName = isCompanyHidden ? 'Confidential Organization' : (company?.trim() || null);

    await pool.query(
      `UPDATE jobs SET 
        title = ?, 
        company = ?, 
        category = ?, 
        location = ?, 
        is_remote = ?, 
        type = ?, 
        salary_range = ?, 
        description = ?, 
        requirements_json = ?, 
        deadline = ?, 
        apply_url = ?, 
        status = ?, 
        gender_preference = ?, 
        qualification_req = ?, 
        language_req = ?, 
        specialization_req = ?, 
        joining_status_req = ?,
        hide_company_name = ?
       WHERE id = ?`,
      [
        title, 
        companyName, 
        category_id, 
        location, 
        is_remote ? 1 : 0, 
        type, 
        salary_range, 
        description, 
        requirements, 
        deadline || null, 
        apply_url, 
        status || 'approved', 
        gender_preference || 'any', 
        qualification_req || null, 
        language_req ? (typeof language_req === 'string' ? language_req : JSON.stringify(language_req)) : null, 
        specialization_req || null, 
        joining_status_req || null, 
        isCompanyHidden,
        req.params.id
      ]
    );

    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// APPLICANTS PER JOB & CANDIDATE MATCHING
// ────────────────────────────────────────────────────────────────────────────────
router.get('/jobs/:id/applicants', authenticateJWT, hasAccess, async (req, res) => {
  try {
    const { match_status } = req.query;

    // Basic job details including requirements
    const [jobs] = await pool.query(`
      SELECT id, title, company, location, requirements_json, qualification_req, experience_level, 
             specialization_req, gender_preference, language_req, joining_status_req 
      FROM jobs WHERE id = ?
    `, [req.params.id]);
    
    if (jobs.length === 0) return res.status(404).json({ message: 'Job not found' });
    const job = jobs[0];

    // Applicants with student info
    const [applicants] = await pool.query(`
      SELECT ja.*, 
             u.name as fallback_name, u.email as fallback_email, up.avatar_url,
             (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = ja.student_id AND e.status = 'completed') as courses_completed,
             (
               SELECT GROUP_CONCAT(c.title SEPARATOR '||')
               FROM enrollments e
               JOIN courses c ON e.course_id = c.id
               WHERE e.student_id = ja.student_id AND e.status = 'completed'
             ) as completed_course_names,
             (SELECT COUNT(*) FROM certificates c WHERE c.student_id = ja.student_id AND c.status = 'active') as certs_active
      FROM job_applications ja
      JOIN users u ON ja.student_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE ja.job_id = ?
      ORDER BY ja.applied_at DESC
    `, [req.params.id]);

    // Compute match score and breakdown for each applicant
    const scoredApplicants = applicants.map(app => {
      const match = calculateJobMatch({
        requirements_json: job.requirements_json,
        qualification_req: job.qualification_req,
        experience_level: job.experience_level,
        specialization_req: job.specialization_req,
        gender_preference: job.gender_preference,
        language_req: job.language_req,
        joining_status_req: job.joining_status_req
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

    let result = scoredApplicants;
    if (match_status === 'matched') {
      result = scoredApplicants.filter(a => a.isMatch);
    } else if (match_status === 'unmatched') {
      result = scoredApplicants.filter(a => !a.isMatch);
    }

    result.sort((a, b) => b.matchScore - a.matchScore || new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());

    res.json({ job, applicants: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch matching students from talent pool for a specific job (Admin)
router.get('/jobs/:id/matched-candidates', authenticateJWT, hasAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { minScore = 0, limit = 100 } = req.query;

    const [jobs] = await pool.query('SELECT id FROM jobs WHERE id = ?', [id]);
    if (!jobs.length) return res.status(404).json({ message: 'Job not found' });

    const data = await getJobMatchedCandidates(id, {
      minScore: parseInt(minScore, 10) || 0,
      limit: parseInt(limit, 10) || 100
    });

    res.json(data);
  } catch (error) {
    console.error('Error in admin matched-candidates:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch matched candidates' });
  }
});

// Direct candidate invitation from admin to student
router.post('/jobs/:id/invite-candidate', authenticateJWT, hasAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, message } = req.body;

    if (!student_id) {
      return res.status(400).json({ message: 'student_id is required' });
    }

    // Verify job
    const [jobs] = await pool.query(`
      SELECT j.id, j.title, j.company, ep.company_name, u.name as poster_name
      FROM jobs j
      LEFT JOIN employer_profiles ep ON ep.user_id = j.posted_by
      LEFT JOIN users u ON u.id = j.posted_by
      WHERE j.id = ?
    `, [id]);

    if (!jobs.length) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const job = jobs[0];
    const companyDisplayName = job.company_name || job.company || 'Brix Ecosystem Partner';

    // Verify student
    const [students] = await pool.query('SELECT id, name, email FROM users WHERE id = ? AND role = "student"', [student_id]);
    if (!students.length) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const student = students[0];

    const inviteTitle = `🎯 Job Invitation: ${job.title} at ${companyDisplayName}`;
    const inviteMessage = message || `Hello ${student.name}, based on your matching profile and skills, you have been invited to apply for "${job.title}".`;

    // Send notification + email
    await createNotification({
      userId: student.id,
      type: 'job_invitation',
      title: inviteTitle,
      message: inviteMessage,
      link: `/jobs/${job.id}`,
      emailNotify: true
    });

    res.json({ message: 'Invitation successfully sent to candidate!', student_name: student.name });
  } catch (error) {
    console.error('Error inviting candidate (Admin):', error);
    res.status(500).json({ message: error.message || 'Failed to send invitation' });
  }
});

router.put('/job-applications/:id/status', authenticateJWT, hasAccess, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE job_applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Application status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/jobs/:id', authenticateJWT, hasAccess, async (req, res) => {
  try {
    await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
