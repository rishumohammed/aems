import express from 'express';
import { pool } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import emailService from '../services/email.service.js';

const router = express.Router();

// Get students list with filters
router.get('/', async (req, res) => {
  try {
    const { search, courseId, status, paymentStatus, page = 1, limit = 25 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [`u.role = 'student'`];
    const params = [];
    const countParams = [];

    if (search) {
      conditions.push(`(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      conditions.push(`u.status = ?`);
      params.push(status);
    }

    if (paymentStatus) {
      if (paymentStatus === 'paid') {
        conditions.push(`(SELECT SUM(balance_due) FROM invoices WHERE student_id = u.id) <= 0 AND (SELECT SUM(amount) FROM invoices WHERE student_id = u.id) > 0`);
      } else if (paymentStatus === 'partial') {
        conditions.push(`(SELECT SUM(amount_paid) FROM invoices WHERE student_id = u.id) > 0 AND (SELECT SUM(balance_due) FROM invoices WHERE student_id = u.id) > 0`);
      } else if (paymentStatus === 'pending') {
        conditions.push(`((SELECT SUM(amount_paid) FROM invoices WHERE student_id = u.id) IS NULL OR (SELECT SUM(amount_paid) FROM invoices WHERE student_id = u.id) = 0)`);
      }
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');
    countParams.push(...params);

    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at, sp.student_id,
             (SELECT GROUP_CONCAT(c.title) FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.student_id = u.id) as enrolled_courses,
             (SELECT AVG(completion_percentage) FROM enrollments WHERE student_id = u.id) as avg_progress,
             COALESCE((SELECT SUM(amount) FROM invoices WHERE student_id = u.id), 0) as total_amount,
             COALESCE((SELECT SUM(amount_paid) FROM invoices WHERE student_id = u.id), 0) as amount_paid,
             COALESCE((SELECT SUM(balance_due) FROM invoices WHERE student_id = u.id), 0) as remaining_amount,
             (
               SELECT 
                 CASE 
                   WHEN SUM(amount) = 0 OR SUM(amount) IS NULL THEN 'pending'
                   WHEN SUM(balance_due) <= 0 THEN 'paid'
                   WHEN SUM(amount_paid) > 0 THEN 'partial'
                   ELSE 'pending'
                 END
               FROM invoices WHERE student_id = u.id
             ) as payment_status
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      ${whereClause}
      ORDER BY u.created_at DESC LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));

    const [students] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM users u ${whereClause}`, countParams);

    res.json({ students, total });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get detailed student profile
router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT u.*, up.*, sp.*, creator.name as converted_by_name
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN users creator ON sp.converted_by = creator.id
      WHERE u.id = ? AND u.role = 'student'
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update student profile
router.put('/:id/profile', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const data = req.body;

    await connection.beginTransaction();

    // Update users table
    await connection.query(
      'UPDATE users SET name = ?, phone = ?, status = ? WHERE id = ?',
      [data.name, data.phone, data.status, id]
    );

    // Update student_profiles
    await connection.query(`
      INSERT INTO student_profiles (
        user_id, date_of_birth, gender, address, linkedin_url, 
        experience_years, current_status, last_company, last_role, 
        last_role_duration, skills, education_json, experience_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        date_of_birth = VALUES(date_of_birth),
        gender = VALUES(gender),
        address = VALUES(address),
        linkedin_url = VALUES(linkedin_url),
        experience_years = VALUES(experience_years),
        current_status = VALUES(current_status),
        last_company = VALUES(last_company),
        last_role = VALUES(last_role),
        last_role_duration = VALUES(last_role_duration),
        skills = VALUES(skills),
        education_json = VALUES(education_json),
        experience_json = VALUES(experience_json)
    `, [
      id, data.date_of_birth, data.gender, data.address, data.linkedin_url,
      data.experience_years, data.current_status, data.last_company, data.last_role,
      data.last_role_duration, JSON.stringify(data.skills || []), 
      JSON.stringify(data.education_json || []), JSON.stringify(data.experience_json || [])
    ]);

    await connection.commit();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Get student invoices
router.get('/:id/invoices', async (req, res) => {
  try {
    const { id } = req.params;
    const [invoices] = await pool.query(`
      SELECT i.*, c.title as course_title
      FROM invoices i
      LEFT JOIN courses c ON i.course_id = c.id
      WHERE i.student_id = ?
      ORDER BY i.created_at DESC
    `, [id]);
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Record offline payment
router.post('/invoices/:invoiceId/record-payment', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { invoiceId } = req.params;
    const { amount, mode, reference, date } = req.body;

    await connection.beginTransaction();

    // Add payment record
    await connection.query(
      'INSERT INTO invoice_payments (id, invoice_id, amount, mode, reference, paid_at) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), invoiceId, amount, mode, reference, date || new Date()]
    );

    // Update invoice
    await connection.query(`
      UPDATE invoices 
      SET amount_paid = amount_paid + ?,
          balance_due = balance_due - ?,
          payment_status = CASE 
            WHEN amount_paid + ? >= amount THEN 'paid'
            WHEN amount_paid + ? > 0 THEN 'partial'
            ELSE 'pending'
          END
      WHERE id = ?
    `, [amount, amount, amount, amount, invoiceId]);

    await connection.commit();
    res.json({ message: 'Payment recorded successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    connection.release();
  }
});

// Get student exams
router.get('/:id/exams', async (req, res) => {
  try {
    const { id } = req.params;
    const [exams] = await pool.query(`
      SELECT ea.*, e.title as exam_title, c.title as course_title,
             TIMESTAMPDIFF(MINUTE, ea.started_at, ea.submitted_at) as duration_taken,
             (SELECT COUNT(*) FROM proctoring_events pe WHERE pe.attempt_id = ea.id) as proctoring_alerts
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      JOIN courses c ON e.course_id = c.id
      WHERE ea.student_id = ?
      ORDER BY ea.started_at DESC
    `, [id]);
    res.json(exams);
  } catch (error) {
    console.error('Error fetching student exams:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student certificates
router.get('/:id/certificates', async (req, res) => {
  try {
    const { id } = req.params;
    const [certificates] = await pool.query(`
      SELECT cert.*, c.title as course_title
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      WHERE cert.student_id = ?
      ORDER BY cert.issued_at DESC
    `, [id]);
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching student certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student's external certificates
router.get('/:id/external-certificates', async (req, res) => {
  try {
    const { id } = req.params;
    const [certificates] = await pool.query(
      'SELECT * FROM external_certificates WHERE student_id = ? ORDER BY issue_date DESC',
      [id]
    );
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching student external certificates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student job applications
router.get('/:id/jobs', async (req, res) => {
  try {
    const { id } = req.params;
    const [applications] = await pool.query(`
      SELECT ja.*, j.title as job_title, j.company
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.student_id = ?
      ORDER BY ja.applied_at DESC
    `, [id]);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching student jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student's enrolled courses
router.get('/:id/courses', async (req, res) => {
  try {
    const { id } = req.params;
    const [courses] = await pool.query(`
      SELECT c.*, e.id as enrollment_id, e.enrolled_at, e.completion_percentage, e.status as enrollment_status
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = ?
    `, [id]);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get student's social platform status
router.get('/:id/social-status', async (req, res) => {
  try {
    const { id } = req.params;
    const [statusList] = await pool.query(`
      SELECT 
        sp.name AS platform_name, 
        sp.icon, 
        sp.color, 
        sp.url, 
        sps.id AS status_id, 
        sps.followed_status, 
        sps.followed_at 
      FROM social_platforms sp
      LEFT JOIN student_social_platform_status sps 
        ON sp.name = sps.platform_name AND sps.student_id = ?
      WHERE sp.is_active = 1
      ORDER BY sp.created_at ASC
    `, [id]);
    res.json(statusList);
  } catch (error) {
    console.error('Error fetching student social status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create/Update student's social platform status (Admin)
router.post('/:id/social-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { platform_name, followed_status } = req.body;
    
    if (!platform_name) {
      return res.status(400).json({ message: 'platform_name is required' });
    }

    const statusToSet = followed_status === 'unfollowed' ? 'unfollowed' : 'followed';
    const statusId = uuidv4();

    await pool.query(`
      INSERT INTO student_social_platform_status (id, student_id, platform_name, followed_status, followed_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        followed_status = VALUES(followed_status),
        followed_at = IF(VALUES(followed_status) = 'followed', CURRENT_TIMESTAMP, NULL)
    `, [statusId, id, platform_name, statusToSet]);

    res.json({ message: 'Follow status saved successfully' });
  } catch (error) {
    console.error('Error saving student social status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete student's social platform status (Admin)
router.delete('/:id/social-status/:platform', async (req, res) => {
  try {
    const { id, platform } = req.params;
    await pool.query('DELETE FROM student_social_platform_status WHERE student_id = ? AND platform_name = ?', [id, platform]);
    res.json({ message: 'Follow status removed completely' });
  } catch (error) {
    console.error('Error deleting student social status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/send-welcome', async (req, res) => {
  try {
    const { id } = req.params;
    const { tempPassword } = req.body;
    
    const [rows] = await pool.query(`
      SELECT u.name, u.email, sp.student_id
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const student = rows[0];
    
    emailService.sendWelcomeEmail(
      { name: student.name, email: student.email },
      { password: tempPassword || 'Abc@12345' },
      'Your LMS Course'
    );
    
    res.json({ message: 'Welcome email sent successfully' });
  } catch (err) {
    console.error('Resend welcome email error:', err);
    res.status(500).json({ message: 'Failed to send welcome email' });
  }
});

export default router;
