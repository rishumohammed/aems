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

    const conditions = [`u.role = 'student'`, `u.deleted_at IS NULL`];
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

    const student = rows[0];
    if (!student.student_id) {
      const [activeEnrollments] = await pool.query(
        'SELECT id FROM enrollments WHERE student_id = ? AND status IN ("active", "completed") LIMIT 1',
        [id]
      );
      if (activeEnrollments.length > 0) {
        const enrollmentService = (await import('../services/enrollment.service.js')).default;
        const newStudentId = await enrollmentService.ensureStudentId(pool, id);
        student.student_id = newStudentId;
      }
    }

    res.json(student);
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
        last_role_duration, skills, education_json, experience_json,
        education_level, college_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        experience_json = VALUES(experience_json),
        education_level = VALUES(education_level),
        college_name = VALUES(college_name)
    `, [
      id, data.date_of_birth, data.gender, data.address, data.linkedin_url,
      data.experience_years, data.current_status, data.last_company, data.last_role,
      data.last_role_duration, JSON.stringify(data.skills || []), 
      JSON.stringify(data.education_json || []), JSON.stringify(data.experience_json || []),
      data.education_level || null, data.college_name || null
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

// Get student's enrolled courses with attached invoice billing details
router.get('/:id/courses', async (req, res) => {
  try {
    const { id } = req.params;
    const [courses] = await pool.query(`
      SELECT 
        c.id as course_id,
        c.title,
        c.slug,
        c.price as original_course_price,
        c.thumbnail_url,
        c.tutor_id,
        u.name as tutor_name,
        e.id as enrollment_id, 
        e.enrolled_at, 
        e.completion_percentage, 
        e.status as enrollment_status,
        (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id = e.id AND lp.completed = TRUE) as completed_lessons,
        (SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id JOIN curriculum_sections cs ON m.section_id = cs.id WHERE cs.course_id = c.id) as total_lessons,
        i.id as invoice_id,
        i.invoice_number,
        i.amount as invoice_amount,
        i.total_fee as invoice_total_fee,
        i.amount_paid as invoice_amount_paid,
        i.balance_due as invoice_balance_due,
        i.payment_status as invoice_payment_status,
        i.payment_mode as invoice_payment_mode,
        i.pdf_path as invoice_pdf_path
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.tutor_id = u.id
      LEFT JOIN invoices i ON i.student_id = e.student_id AND i.course_id = e.course_id AND i.payment_status != 'voided'
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `, [id]);

    const formatted = courses.map(c => ({
      ...c,
      id: c.enrollment_id,
      course_id: c.course_id,
      status: c.enrollment_status,
      price: c.invoice_amount !== null ? parseFloat(c.invoice_amount) : parseFloat(c.original_course_price || 0),
      amount_paid: parseFloat(c.invoice_amount_paid || 0),
      balance_due: c.invoice_balance_due !== null ? parseFloat(c.invoice_balance_due) : parseFloat(c.invoice_amount || c.original_course_price || 0),
      payment_status: c.invoice_payment_status || 'pending'
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove / Unenroll student from course
router.delete('/:id/courses/:enrollmentId', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id: studentId, enrollmentId } = req.params;
    const { cancel_invoice = true } = req.body || {};

    await connection.beginTransaction();

    // 1. Find enrollment
    const [enrollments] = await connection.query(
      'SELECT * FROM enrollments WHERE id = ? AND student_id = ?',
      [enrollmentId, studentId]
    );
    if (enrollments.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    const enrollment = enrollments[0];

    // 2. Delete lesson progress
    await connection.query('DELETE FROM lesson_progress WHERE enrollment_id = ?', [enrollmentId]);

    // 3. Delete enrollment
    await connection.query('DELETE FROM enrollments WHERE id = ?', [enrollmentId]);

    // 4. Handle attached invoices if requested
    if (cancel_invoice) {
      const [invoices] = await connection.query(
        'SELECT * FROM invoices WHERE student_id = ? AND course_id = ? AND payment_status != "voided"',
        [studentId, enrollment.course_id]
      );
      for (const inv of invoices) {
        if (parseFloat(inv.amount_paid) === 0) {
          await connection.query('DELETE FROM invoice_payments WHERE invoice_id = ?', [inv.id]);
          await connection.query('DELETE FROM invoices WHERE id = ?', [inv.id]);
        } else {
          await connection.query(
            'UPDATE invoices SET payment_status = "voided", balance_due = 0, balance_amount = 0 WHERE id = ?',
            [inv.id]
          );
        }
      }
    }

    await connection.commit();
    res.json({ message: 'Enrolled course removed successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error removing enrolled course:', error);
    res.status(500).json({ message: 'Failed to remove enrolled course' });
  } finally {
    connection.release();
  }
});

// Change / Transfer student to another course
router.post('/:id/courses/:enrollmentId/change', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id: studentId, enrollmentId } = req.params;
    const { new_course_id, new_price, reset_progress = true } = req.body;

    if (!new_course_id) {
      return res.status(400).json({ message: 'New course is required' });
    }

    await connection.beginTransaction();

    // 1. Verify enrollment
    const [enrollments] = await connection.query(
      'SELECT * FROM enrollments WHERE id = ? AND student_id = ?',
      [enrollmentId, studentId]
    );
    if (enrollments.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    const currentEnrollment = enrollments[0];
    const oldCourseId = currentEnrollment.course_id;

    if (oldCourseId === new_course_id) {
      await connection.rollback();
      return res.status(400).json({ message: 'Selected course is the same as the currently enrolled course' });
    }

    // 2. Check if already enrolled in new course
    const [existingNew] = await connection.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, new_course_id]
    );
    if (existingNew.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Student is already enrolled in the selected course' });
    }

    // 3. Verify new course exists
    const [newCourses] = await connection.query('SELECT * FROM courses WHERE id = ?', [new_course_id]);
    if (newCourses.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Target course not found' });
    }
    const targetCourse = newCourses[0];

    // 4. Update enrollment
    const newCompletion = reset_progress ? 0 : currentEnrollment.completion_percentage;
    await connection.query(
      'UPDATE enrollments SET course_id = ?, completion_percentage = ? WHERE id = ?',
      [new_course_id, newCompletion, enrollmentId]
    );

    if (reset_progress) {
      await connection.query('DELETE FROM lesson_progress WHERE enrollment_id = ?', [enrollmentId]);
    }

    // 5. Update / Migrate Attached Invoice
    const [invoices] = await connection.query(
      'SELECT * FROM invoices WHERE student_id = ? AND course_id = ? AND payment_status != "voided" ORDER BY created_at DESC LIMIT 1',
      [studentId, oldCourseId]
    );

    const targetPrice = new_price !== undefined && new_price !== null && new_price !== ''
      ? parseFloat(new_price)
      : parseFloat(targetCourse.price || 0);

    if (invoices.length > 0) {
      const inv = invoices[0];
      const amountPaid = parseFloat(inv.amount_paid) || 0;
      const balanceDue = Math.max(0, targetPrice - amountPaid);
      const newPaymentStatus = balanceDue <= 0 ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending');

      await connection.query(`
        UPDATE invoices 
        SET course_id = ?,
            amount = ?,
            total_fee = ?,
            balance_due = ?,
            balance_amount = ?,
            payment_status = ?,
            pdf_path = NULL
        WHERE id = ?
      `, [new_course_id, targetPrice, targetPrice, balanceDue, balanceDue, newPaymentStatus, inv.id]);
    } else {
      if (targetPrice > 0) {
        const invoiceId = uuidv4();
        await connection.query(`
          INSERT INTO invoices (id, student_id, course_id, amount, total_fee, amount_paid, balance_due, balance_amount, payment_mode, payment_status)
          VALUES (?, ?, ?, ?, ?, 0, ?, ?, 'offline', 'pending')
        `, [invoiceId, studentId, new_course_id, targetPrice, targetPrice, targetPrice, targetPrice]);
      }
    }

    await connection.commit();
    res.json({ message: 'Course successfully changed to ' + targetCourse.title, new_course_title: targetCourse.title });
  } catch (error) {
    await connection.rollback();
    console.error('Error changing student course:', error);
    res.status(500).json({ message: 'Failed to change course' });
  } finally {
    connection.release();
  }
});

// Adjust invoiced course price
router.put('/invoices/:invoiceId/adjust-price', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { invoiceId } = req.params;
    const { price } = req.body;

    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }

    await connection.beginTransaction();

    const [invoices] = await connection.query('SELECT * FROM invoices WHERE id = ? FOR UPDATE', [invoiceId]);
    if (invoices.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const inv = invoices[0];
    const amountPaid = parseFloat(inv.amount_paid) || 0;
    const balanceDue = Math.max(0, newPrice - amountPaid);
    const paymentStatus = balanceDue <= 0 ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending');

    await connection.query(`
      UPDATE invoices 
      SET amount = ?,
          total_fee = ?,
          balance_due = ?,
          balance_amount = ?,
          payment_status = ?,
          pdf_path = NULL
      WHERE id = ?
    `, [newPrice, newPrice, balanceDue, balanceDue, paymentStatus, invoiceId]);

    await connection.commit();
    res.json({ message: 'Invoiced price adjusted successfully', new_amount: newPrice, balance_due: balanceDue, payment_status: paymentStatus });
  } catch (error) {
    await connection.rollback();
    console.error('Error adjusting invoice price:', error);
    res.status(500).json({ message: 'Failed to adjust invoice price' });
  } finally {
    connection.release();
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
    
    await emailService.sendWelcomeEmail(
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

// Soft Delete Student
router.delete('/:id', async (req, res) => {
  const targetId = req.params.id;
  try {
    const [existing] = await pool.query('SELECT email FROM users WHERE id = ? AND role = "student"', [targetId]);
    if (existing.length === 0) return res.status(404).json({ message: 'Student not found' });

    const emailSuffix = `.deleted.${Date.now()}`;
    const newEmail = `${existing[0].email}${emailSuffix}`;

    await pool.query(
      "UPDATE users SET deleted_at = NOW(), status = 'inactive', email = ? WHERE id = ?",
      [newEmail, targetId]
    );

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error soft deleting student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
