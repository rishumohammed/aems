import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { createNotification } from '../services/notification.service.js';
import emailService from '../services/email.service.js';
import enrollmentService from '../services/enrollment.service.js';

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles('super_admin'));

router.get('/users', async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = 'SELECT id, name, email, role, status, created_at FROM users';
    const params = [];
    const conditions = [];
    
    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [users] = await pool.query(query, params);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create User
router.post('/users', async (req, res) => {
  const { name, email, role, send_welcome, course_ids } = req.body;
  try {
    const id = uuidv4();
    const charsLowerCase = "abcdefghijklmnopqrstuvwxyz";
    const charsUpperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charsNumbers = "0123456789";
    const charsSpecial = "!@#$%^&*";
    
    let defaultPassword = "";
    defaultPassword += charsLowerCase.charAt(Math.floor(Math.random() * charsLowerCase.length));
    defaultPassword += charsUpperCase.charAt(Math.floor(Math.random() * charsUpperCase.length));
    defaultPassword += charsNumbers.charAt(Math.floor(Math.random() * charsNumbers.length));
    defaultPassword += charsSpecial.charAt(Math.floor(Math.random() * charsSpecial.length));
    
    const allChars = charsLowerCase + charsUpperCase + charsNumbers + charsSpecial;
    for (let i = 0; i < 4; i++) {
      defaultPassword += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle password
    defaultPassword = defaultPassword.split('').sort(() => 0.5 - Math.random()).join('');
    
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await pool.query(
      'INSERT INTO users (id, name, email, role, password_hash, temp_password, force_password_change, status) VALUES (?, ?, ?, ?, ?, ?, 1, "active")',
      [id, name, email, role, hashedPassword, defaultPassword]
    );

    // Initial profile
    await pool.query('INSERT INTO user_profiles (user_id) VALUES (?)', [id]);
    
    // If student, also initialize student_profile
    if (role === 'student') {
      await pool.query('INSERT INTO student_profiles (user_id) VALUES (?)', [id]);
    }

    if (send_welcome) {
      await createNotification({
        userId: id,
        type: 'system',
        title: 'Welcome to AEMS!',
        body: `Your account has been created successfully. Your temporary password is: ${defaultPassword}. Please change it upon your first login.`,
        link: '/settings',
        emailNotify: true
      });
    }

    // Auto-enroll in courses if provided
    if (role === 'student' && Array.isArray(course_ids) && course_ids.length > 0) {
      try {
        const [courses] = await pool.query('SELECT id, price FROM courses WHERE id IN (?)', [course_ids]);
        for (const course of courses) {
          await enrollmentService.enrollStudent({
            studentData: { id, email, name, phone: null },
            courseId: course.id,
            pricing: { amount: parseFloat(course.price) || 0 },
            payment: {
              mode: 'offline',
              amountPaid: 0,
              offlineType: null,
              reference: 'Manual Student Creation',
              notes: ''
            },
            convertedBy: req.user.id
          });
        }
      } catch (enrollErr) {
        console.error('Error auto-enrolling student:', enrollErr);
        // We do not fail the request if enrollment fails, just log it.
      }
    }

    res.status(201).json({ id, name, email, role, temp_password: defaultPassword, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User Status
router.put('/users/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `User status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User Details
router.put('/users/:id', async (req, res) => {
  const { name, role } = req.body;
  try {
    await pool.query('UPDATE users SET name = ?, role = ? WHERE id = ?', [name, role, req.params.id]);
    res.json({ message: 'User updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk Suspend
router.post('/users/bulk-suspend', async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No IDs provided' });
  }
  try {
    await pool.query('UPDATE users SET status = "suspended" WHERE id IN (?)', [ids]);
    res.json({ message: `${ids.length} users suspended` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Reset Password
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const charsLowerCase = "abcdefghijklmnopqrstuvwxyz";
    const charsUpperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charsNumbers = "0123456789";
    const charsSpecial = "!@#$%^&*";
    
    let defaultPassword = "";
    defaultPassword += charsLowerCase.charAt(Math.floor(Math.random() * charsLowerCase.length));
    defaultPassword += charsUpperCase.charAt(Math.floor(Math.random() * charsUpperCase.length));
    defaultPassword += charsNumbers.charAt(Math.floor(Math.random() * charsNumbers.length));
    defaultPassword += charsSpecial.charAt(Math.floor(Math.random() * charsSpecial.length));
    
    const allChars = charsLowerCase + charsUpperCase + charsNumbers + charsSpecial;
    for (let i = 0; i < 4; i++) {
      defaultPassword += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    defaultPassword = defaultPassword.split('').sort(() => 0.5 - Math.random()).join('');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = ?, temp_password = ?, force_password_change = 1 WHERE id = ?',
      [hashedPassword, defaultPassword, req.params.id]
    );
    
    const [users] = await pool.query('SELECT name, email FROM users WHERE id = ?', [req.params.id]);
    if (users.length > 0) {
      const user = users[0];
      try {
        emailService.sendWelcomeEmail(
          { name: user.name, email: user.email },
          { password: defaultPassword },
          'Password Reset'
        );
      } catch (err) {
        console.error('Failed to send reset email:', err);
      }
    }

    res.json({ message: 'Password reset successful', temp_password: defaultPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Category Management
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM course_categories WHERE is_active = true ORDER BY name ASC');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/categories', async (req, res) => {
  const { name, slug, description, icon } = req.body;
  try {
    const id = uuidv4();
    await pool.query(
      'INSERT INTO course_categories (id, name, slug, description, icon) VALUES (?, ?, ?, ?, ?)',
      [id, name, slug || name.toLowerCase().replace(/ /g, '-'), description, icon || 'mdi-tag']
    );
    res.status(201).json({ id, message: 'Category created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  const { name, slug, description, icon } = req.body;
  try {
    await pool.query(
      'UPDATE course_categories SET name = ?, slug = ?, description = ?, icon = ? WHERE id = ?',
      [name, slug, description, icon, req.params.id]
    );
    res.json({ message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM course_categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Tutor Approvals ---

router.get('/tutor-approvals', async (req, res) => {
  try {
    const [tutors] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
             tp.qualification, tp.specialization, tp.teaching_experience, tp.skills_expertise, 
             tp.resume_url, tp.linkedin_url, tp.portfolio_url,
             tp.approval_notes, tp.approved_at, tp.rejection_reason
      FROM users u
      JOIN tutor_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'tutor' AND u.status = 'pending_review'
      ORDER BY u.created_at DESC
    `);
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approved Tutors list
router.get('/tutor-approvals/approved', async (req, res) => {
  try {
    const [tutors] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at, up.avatar_url,
             tp.qualification, tp.specialization, tp.teaching_experience,
             tp.approved_at, tp.linkedin_url, tp.portfolio_url,
             (SELECT COUNT(*) FROM courses c WHERE c.tutor_id = u.id) as course_count,
             (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.tutor_id = u.id) as student_count
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      JOIN tutor_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'tutor' AND u.status = 'active'
      ORDER BY tp.approved_at DESC, u.created_at DESC
    `);
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rejected Tutors list
router.get('/tutor-approvals/rejected', async (req, res) => {
  try {
    const [tutors] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at, up.avatar_url,
             tp.qualification, tp.specialization,
             tp.rejection_reason, tp.rejected_at, tp.linkedin_url
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      JOIN tutor_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'tutor' AND u.status = 'rejected'
      ORDER BY tp.rejected_at DESC, u.created_at DESC
    `);
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/tutor-approve/:id', async (req, res) => {
  const { status, notes } = req.body; // status: 'active' (approve) or 'rejected'
  if (!['active', 'rejected', 'suspended'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Use "active" to approve or "rejected" to reject.' });
  }

  try {
    // Get tutor info for notification
    const [[tutor]] = await pool.query(
      'SELECT u.id, u.name, u.email FROM users u WHERE u.id = ? AND u.role = "tutor"',
      [req.params.id]
    );
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });

    // Update user status
    await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    // Update tutor_profiles with approval/rejection details
    if (status === 'active') {
      await pool.query(
        'UPDATE tutor_profiles SET approval_notes = ?, approved_at = NOW(), approved_by = ?, rejection_reason = NULL, rejected_at = NULL, rejected_by = NULL WHERE user_id = ?',
        [notes || null, req.user.id, req.params.id]
      );
    } else if (status === 'rejected') {
      await pool.query(
        'UPDATE tutor_profiles SET rejection_reason = ?, rejected_at = NOW(), rejected_by = ?, approved_at = NULL, approved_by = NULL WHERE user_id = ?',
        [notes || null, req.user.id, req.params.id]
      );
    }

    const isApproved = status === 'active';

    // Send in-app notification to the tutor
    try {
      if (isApproved) {
        await createNotification({
          userId: req.params.id,
          type: 'system',
          title: '🎉 Tutor Application Approved!',
          body: `Congratulations ${tutor.name}! Your tutor application has been approved. You now have full access to your Tutor Dashboard, course creation tools, and student management.`,
          link: '/dashboard/tutor',
          emailNotify: false
        });
        // Send approval email
        await emailService.sendEmail({
          to: tutor.email,
          subject: '🎉 Your Tutor Application has been Approved — AEMS Academy',
          html: `
            <div style="font-family: sans-serif; padding: 32px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px;">
              <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Application Approved! 🎉</h1>
              </div>
              <p style="font-size: 16px;">Dear <strong>${tutor.name}</strong>,</p>
              <p>We are thrilled to inform you that your tutor application has been <strong style="color: #10b981;">approved</strong>!</p>
              <p>You now have full access to:</p>
              <ul style="line-height: 2;">
                <li>📚 Course Creation &amp; Management</li>
                <li>👥 Student Management Dashboard</li>
                <li>📊 Earnings &amp; Analytics</li>
                <li>🎯 Your Tutor Studio</li>
              </ul>
              ${notes ? `<p style="background:#f0fdf4; padding:12px; border-radius:8px; border-left:4px solid #10b981;"><strong>Admin Notes:</strong> ${notes}</p>` : ''}
              <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/tutor" style="display: inline-block; padding: 14px 32px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Go to Tutor Dashboard</a>
              </div>
              <p style="font-size: 13px; color: #64748b;">Welcome aboard, and we look forward to your contributions to AEMS Academy!</p>
            </div>
          `
        });
      } else if (status === 'rejected') {
        await createNotification({
          userId: req.params.id,
          type: 'system',
          title: 'Tutor Application Update',
          body: `Dear ${tutor.name}, we have reviewed your application and unfortunately we are unable to approve it at this time. ${notes ? 'Reason: ' + notes : ''} Please contact support for more information.`,
          link: '/dashboard',
          emailNotify: false
        });
        // Send rejection email
        await emailService.sendEmail({
          to: tutor.email,
          subject: 'Update on Your Tutor Application — AEMS Academy',
          html: `
            <div style="font-family: sans-serif; padding: 32px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px;">
              <div style="background: linear-gradient(135deg, #64748b, #475569); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Application Update</h1>
              </div>
              <p style="font-size: 16px;">Dear <strong>${tutor.name}</strong>,</p>
              <p>Thank you for your interest in joining AEMS Academy as a tutor. After careful review of your application, we regret to inform you that we are unable to approve your application at this time.</p>
              ${notes ? `<div style="background:#fef2f2; padding:16px; border-radius:8px; border-left:4px solid #ef4444; margin: 16px 0;"><strong>Reason:</strong><br>${notes}</div>` : ''}
              <p>If you have any questions or would like to appeal this decision, please contact us at <a href="mailto:support@aems.local">support@aems.local</a>.</p>
              <p style="font-size: 13px; color: #64748b;">Thank you for your understanding.</p>
            </div>
          `
        });
      }
    } catch (notifError) {
      console.warn('Notification/email sending failed (non-critical):', notifError.message);
    }

    res.json({ 
      message: `Tutor ${isApproved ? 'approved' : 'rejected'} successfully`,
      status 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Employer Approvals ---

router.get('/employer-approvals', async (req, res) => {
  try {
    const [employers] = await pool.query(`
      SELECT u.id, u.name as contact_person, u.email, u.phone, u.status, u.created_at,
             ep.company_name, ep.industry, ep.website, ep.about_company, ep.company_size, ep.approval_status
      FROM users u
      JOIN employer_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'employer' AND ep.approval_status = 'pending_approval'
      ORDER BY u.created_at DESC
    `);
    res.json(employers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/employer-approve/:id', async (req, res) => {
  const { status, notes } = req.body; // status: 'approved', 'rejected', or 'suspended'
  if (!['approved', 'rejected', 'suspended'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    if (status === 'approved') {
      await pool.query(
        'UPDATE employer_profiles SET approval_status = ?, rejection_reason = NULL, rejected_at = NULL, approved_at = NOW(), approved_by = ? WHERE user_id = ?',
        [status, req.user.id, req.params.id]
      );
      // Fetch employer info for email
      const [[employer]] = await pool.query('SELECT u.email, u.name FROM users u WHERE u.id = ?', [req.params.id]);
      if (employer && employer.email) {
        emailService.sendEmail({
          to: employer.email,
          subject: '✅ Your Employer Registration is Approved',
          html: `<p>Hello ${employer.name},</p><p>Your employer account has been approved. You can now post jobs and manage applicants.</p>`
        }).catch(e => console.error('Email error:', e.message));
      }
    } else {
      await pool.query(
        'UPDATE employer_profiles SET approval_status = ?, rejection_reason = ?, rejected_at = NOW(), approved_at = NULL, approved_by = NULL WHERE user_id = ?',
        [status, notes || null, req.params.id]
      );
      // Fetch employer info for email
      const [[employer]] = await pool.query('SELECT u.email, u.name FROM users u WHERE u.id = ?', [req.params.id]);
      if (employer && employer.email && status === 'rejected') {
        emailService.sendEmail({
          to: employer.email,
          subject: '❌ Your Employer Registration was Rejected',
          html: `<p>Hello ${employer.name},</p><p>Unfortunately, your employer registration was rejected.</p><p><strong>Reason:</strong> ${notes || 'No reason provided'}</p>`
        }).catch(e => console.error('Email error:', e.message));
      }
    }
    res.json({ message: `Employer ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Tutor Management ---
router.get('/tutors', async (req, res) => {
  try {
    const [tutors] = await pool.query(`
      SELECT u.id, u.name, u.email, u.status, u.created_at, up.avatar_url,
             tp.specialization,
             (SELECT COUNT(*) FROM courses c WHERE c.tutor_id = u.id) as course_count,
             (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.tutor_id = u.id) as student_count
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
      WHERE u.role = 'tutor' AND u.status IN ('active', 'suspended', 'inactive')
      ORDER BY u.created_at DESC
    `);
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/tutors/:id', async (req, res) => {
  try {
    const [tutors] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at, up.avatar_url,
             tp.qualification, tp.teaching_experience, tp.skills_expertise,
             (SELECT COUNT(*) FROM courses c WHERE c.tutor_id = u.id) as total_courses,
             (SELECT COUNT(*) FROM courses c WHERE c.tutor_id = u.id AND c.status = 'published') as published_courses,
             (SELECT COUNT(*) FROM courses c WHERE c.tutor_id = u.id AND c.status = 'draft') as draft_courses,
             (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.tutor_id = u.id) as total_students,
             0 as avg_rating
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
      WHERE u.id = ? AND u.role = 'tutor'
    `, [req.params.id]);

    if (tutors.length === 0) return res.status(404).json({ message: 'Tutor not found' });

    const [courses] = await pool.query(`
      SELECT c.id, c.slug, c.title, c.status, 
             (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrollments,
             0 as avg_rating
      FROM courses c WHERE c.tutor_id = ?
    `, [req.params.id]);

    res.json({ tutor: tutors[0], courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Employer Management ---
router.get('/employers', async (req, res) => {
  try {
    const [employers] = await pool.query(`
      SELECT u.id, u.email, u.status, u.created_at, u.name as contact_person,
             ep.company_name, ep.logo_url, ep.industry, ep.approval_status,
             (SELECT COUNT(*) FROM jobs j WHERE j.posted_by = u.id) as total_jobs,
             (SELECT COUNT(*) FROM jobs j WHERE j.posted_by = u.id AND j.status = 'pending_approval') as pending_jobs
      FROM users u
      LEFT JOIN employer_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'employer' AND (ep.approval_status IS NULL OR ep.approval_status != 'pending_approval')
      ORDER BY u.created_at DESC
    `);
    res.json(employers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/employers/:id', async (req, res) => {
  try {
    const [employers] = await pool.query(`
      SELECT u.id, u.email, u.status, u.created_at, u.name as contact_person,
             ep.company_name, ep.logo_url, ep.industry, ep.website, ep.about_company as description, ep.approval_status,
             (SELECT COUNT(*) FROM jobs j WHERE j.posted_by = u.id) as total_jobs,
             (SELECT COUNT(*) FROM jobs j WHERE j.posted_by = u.id AND j.status = 'approved') as active_jobs,
             (SELECT COUNT(*) FROM jobs j WHERE j.posted_by = u.id AND j.status = 'pending_approval') as pending_approval_jobs,
             (SELECT COUNT(*) FROM job_applications ja JOIN jobs j ON ja.job_id = j.id WHERE j.posted_by = u.id) as total_applications
      FROM users u
      LEFT JOIN employer_profiles ep ON u.id = ep.user_id
      WHERE u.id = ? AND u.role = 'employer'
    `, [req.params.id]);

    if (employers.length === 0) return res.status(404).json({ message: 'Employer not found' });

    const [jobs] = await pool.query(`
      SELECT j.id, j.title, j.status, j.created_at,
             (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as application_count
      FROM jobs j
      WHERE j.posted_by = ?
      ORDER BY j.created_at DESC
    `, [req.params.id]);

    res.json({ employer: employers[0], jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Pending Course Approvals
router.get('/courses/pending-approvals', async (req, res) => {
  try {
    const [courses] = await pool.query(`
      SELECT c.id, c.title, c.slug, c.status, c.created_at, c.description, c.short_description, c.level, c.language, c.price_type, c.price, c.thumbnail_url,
      u.name as tutor_name, u.email as tutor_email, cat.name as category_name,
      (SELECT COUNT(*) FROM course_sections WHERE course_id = c.id) as section_count,
      (SELECT COUNT(*) FROM course_modules m JOIN course_sections s ON m.section_id = s.id WHERE s.course_id = c.id) as module_count,
      (SELECT COUNT(*) FROM course_lessons l JOIN course_sections s ON l.section_id = s.id WHERE s.course_id = c.id) as lesson_count
      FROM courses c
      JOIN users u ON c.tutor_id = u.id
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      WHERE c.status = 'pending_review' AND c.approval_required = true
      ORDER BY c.created_at ASC
    `);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get full course details for admin review (with full curriculum)
router.get('/courses/:id/full-details', async (req, res) => {
  try {
    const [course] = await pool.query(`
      SELECT c.*, u.name as tutor_name, u.email as tutor_email, u.phone as tutor_phone,
      cat.name as category_name,
      (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count
      FROM courses c
      JOIN users u ON c.tutor_id = u.id
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (course.length === 0) return res.status(404).json({ message: 'Course not found' });

    // Fetch full curriculum: sections -> modules -> lessons
    const [sections] = await pool.query('SELECT * FROM course_sections WHERE course_id = ? ORDER BY order_index', [req.params.id]);
    
    for (let section of sections) {
      const [modules] = await pool.query('SELECT * FROM course_modules WHERE section_id = ? ORDER BY order_index', [section.id]);
      section.modules = modules;
      for (let module of modules) {
        const [lessons] = await pool.query('SELECT id, title, type, duration_seconds, is_free_preview, video_source, resource_url, is_mandatory, order_index FROM course_lessons WHERE module_id = ? ORDER BY order_index', [module.id]);
        module.lessons = lessons;
      }
    }

    // Fetch prerequisites
    const [prereqs] = await pool.query(`
      SELECT p.prerequisite_course_id as id, c2.title 
      FROM course_prerequisites p 
      JOIN courses c2 ON p.prerequisite_course_id = c2.id 
      WHERE p.course_id = ?
    `, [req.params.id]);

    res.json({ ...course[0], sections, prerequisites: prereqs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Approve Course
router.put('/courses/:id/approve', async (req, res) => {
  try {
    await pool.query(
      'UPDATE courses SET status = "published", approved_by = ?, published_at = NOW(), approval_required = false WHERE id = ?',
      [req.user.id, req.params.id]
    );

    const [course] = await pool.query('SELECT title, tutor_id FROM courses WHERE id = ?', [req.params.id]);
    if (course.length > 0 && course[0].tutor_id) {
      await createNotification({
        userId: course[0].tutor_id,
        type: 'success',
        title: 'Course Approved',
        body: `Your course "${course[0].title}" has been approved and is now published.`,
        link: `/dashboard/tutor/courses`
      });
    }

    res.json({ message: 'Course approved and published' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject Course
router.put('/courses/:id/reject', async (req, res) => {
  const { reason } = req.body;
  try {
    await pool.query(
      'UPDATE courses SET status = "rejected", rejection_reason = ? WHERE id = ?',
      [reason || 'No reason provided', req.params.id]
    );

    const [course] = await pool.query('SELECT title, tutor_id FROM courses WHERE id = ?', [req.params.id]);
    if (course.length > 0 && course[0].tutor_id) {
      await createNotification({
        userId: course[0].tutor_id,
        type: 'error',
        title: 'Course Rejected',
        body: `Your course "${course[0].title}" was rejected. Reason: ${reason || 'See details.'}`,
        link: `/dashboard/tutor/courses`
      });
    }

    res.json({ message: 'Course rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
