import express from 'express';
import { authenticateJWT, authorizeRoles, requirePermission } from '../middleware/auth.js';
import { pool } from '../db/connection.js';
import invoiceService from '../services/invoice.service.js';
import { createNotification } from '../services/notification.service.js';

const router = express.Router();
const hasAccess = requirePermission('finance');

import financeService from '../services/finance.service.js';

// Admin: Finance Summary
router.get('/summary', authenticateJWT, hasAccess, async (req, res) => {
  try {
    const summary = await financeService.getSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Monthly Revenue (Last 12 months)
router.get('/monthly-revenue', authenticateJWT, hasAccess, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(amount_paid) as revenue
      FROM invoices
      WHERE payment_status != 'voided'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Outstanding Dues
router.get('/outstanding', authenticateJWT, hasAccess, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.id, i.invoice_number, i.balance_due, i.due_date,
        u.name as student_name, u.email as student_email,
        c.title as course_title
      FROM invoices i
      JOIN users u ON i.student_id = u.id
      LEFT JOIN courses c ON i.course_id = c.id
      WHERE i.balance_due > 0 AND i.payment_status != 'voided'
      ORDER BY i.due_date ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Invoice Management - List all
router.get('/invoices', authenticateJWT, hasAccess, async (req, res) => {
  try {
    const { status, course_id } = req.query;
    let query = `
      SELECT i.*, u.name as student_name, c.title as course_title,
             (SELECT mode FROM invoice_payments WHERE invoice_id = i.id ORDER BY paid_at DESC LIMIT 1) as latest_payment_mode
      FROM invoices i
      JOIN users u ON i.student_id = u.id
      LEFT JOIN courses c ON i.course_id = c.id
    `;
    const params = [];
    
    if (status || course_id) {
      query += ' WHERE ';
      if (status) {
        query += 'i.payment_status = ?';
        params.push(status);
      }
      if (course_id) {
        if (status) query += ' AND ';
        query += 'i.course_id = ?';
        params.push(course_id);
      }
    }
    
    query += ' ORDER BY i.created_at DESC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get Invoice Payments
router.get('/invoices/:id/payments', authenticateJWT, hasAccess, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM invoice_payments WHERE invoice_id = ? ORDER BY paid_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Record Offline Payment
router.post('/invoices/:id/record-payment', authenticateJWT, hasAccess, async (req, res) => {
  const { amount, mode, reference } = req.body;
  try {
    const result = await invoiceService.recordPayment(req.params.id, amount, mode, reference);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Void Invoice
router.put('/invoices/:id/void', authenticateJWT, hasAccess, async (req, res) => {
  const { reason } = req.body;
  try {
    await invoiceService.voidInvoice(req.params.id, reason);
    res.json({ message: 'Invoice voided' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Generate PDF
router.post('/invoices/:id/generate-pdf', authenticateJWT, hasAccess, async (req, res) => {
  try {
    const pdfUrl = await invoiceService.generatePDF(req.params.id);
    res.json({ pdf_path: pdfUrl, message: 'PDF generated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update Invoice Details Manually
router.put('/invoices/:id/payment-details', authenticateJWT, hasAccess, async (req, res) => {
  const { total_fee, amount_paid, balance_amount, payment_status, last_payment_date, payment_reference } = req.body;
  try {
    // Perform direct database update
    await pool.query(
      `UPDATE invoices 
       SET amount = ?, total_fee = ?, amount_paid = ?, balance_due = ?, balance_amount = ?, 
           payment_status = ?, last_payment_date = ?, payment_reference = ?
       WHERE id = ?`,
      [
        total_fee, total_fee, amount_paid, balance_amount, balance_amount, 
        payment_status, last_payment_date ? new Date(last_payment_date) : null, payment_reference || null,
        req.params.id
      ]
    );

    // If marked as paid, trigger certificate checks/notifications
    if (payment_status === 'paid') {
      try {
        const [invoices] = await pool.query('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
        if (invoices.length > 0) {
          const invoice = invoices[0];
          
          // Trigger notifications
          const [details] = await pool.query(`
            SELECT i.*, u.name as student_name, u.email as student_email, c.title as course_title
            FROM invoices i
            JOIN users u ON i.student_id = u.id
            LEFT JOIN courses c ON i.course_id = c.id
            WHERE i.id = ?
          `, [req.params.id]);

          if (details.length > 0) {
            const detail = details[0];
            await createNotification({
              userId: invoice.student_id,
              type: 'system',
              title: 'Course Fully Paid: ' + detail.course_title,
              body: `Hi ${detail.student_name}, your payment details for ${detail.course_title} have been updated to Fully Paid.`,
              link: '/dashboard/student/payments',
              emailNotify: true
            });
          }

          // Check and issue certificate
          const [passedAttempts] = await pool.query(`
            SELECT ea.id FROM exam_attempts ea
            JOIN exams e ON ea.exam_id = e.id
            WHERE ea.student_id = ? AND e.course_id = ? AND ea.passed = TRUE
            ORDER BY ea.submitted_at DESC LIMIT 1
          `, [invoice.student_id, invoice.course_id]);

          if (passedAttempts.length > 0) {
            const attemptId = passedAttempts[0].id;
            const [existingCerts] = await pool.query(
              'SELECT id FROM certificates WHERE student_id = ? AND course_id = ? AND status = "active"',
              [invoice.student_id, invoice.course_id]
            );
            if (existingCerts.length === 0) {
              const certService = (await import('../services/certificate.service.js')).default;
              await certService.generate(attemptId);

              await createNotification({
                userId: invoice.student_id,
                type: 'system',
                title: 'Certificate Issued! 🎓',
                body: 'Congratulations! Your certificate is now ready as your course is fully paid.',
                link: '/dashboard/student/payments',
                emailNotify: true
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to trigger post-manual-update actions:', err);
      }
    }

    res.json({ message: 'Invoice updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Admin: Offline Payments Management ───────────────────────────────────────

// GET /api/admin/finance/offline-payments — list all pending/offline payments
router.get('/offline-payments', authenticateJWT, hasAccess, async (req, res) => {
  try {
    const { status } = req.query;
    let where = `ip.mode IN ('bank_transfer', 'upi', 'cash', 'cheque')`;
    const params = [];
    if (status) {
      where += ` AND ip.status = ?`;
      params.push(status);
    }

    const [rows] = await pool.query(`
      SELECT 
        ip.id as payment_id, ip.amount, ip.mode, ip.reference, ip.paid_at, ip.status as payment_status,
        ip.proof_path, ip.remarks,
        i.id as invoice_id, i.invoice_number, i.total_fee, i.balance_due,
        u.name as student_name, u.email as student_email,
        c.title as course_title,
        e.id as enrollment_id, e.status as enrollment_status
      FROM invoice_payments ip
      JOIN invoices i ON ip.invoice_id = i.id
      JOIN users u ON i.student_id = u.id
      LEFT JOIN courses c ON i.course_id = c.id
      LEFT JOIN enrollments e ON (e.student_id = i.student_id AND e.course_id = i.course_id)
      WHERE ${where}
      ORDER BY ip.paid_at DESC
    `, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/finance/offline-payments/:id/approve
router.put('/offline-payments/:id/approve', authenticateJWT, hasAccess, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { adjustedAmount } = req.body;
    const adminId = req.user.id;

    // Get payment with invoice & enrollment info
    const [payments] = await connection.query(`
      SELECT ip.*, i.student_id, i.course_id, i.total_fee, i.id as invoice_id
      FROM invoice_payments ip
      JOIN invoices i ON ip.invoice_id = i.id
      WHERE ip.id = ?
    `, [id]);

    if (payments.length === 0) return res.status(404).json({ message: 'Payment not found' });
    const payment = payments[0];

    const approvedAmount = adjustedAmount ? parseFloat(adjustedAmount) : parseFloat(payment.amount);
    const totalFee = parseFloat(payment.total_fee);

    // Get previously approved payments for this invoice
    const [prevPayments] = await connection.query(
      `SELECT SUM(amount) as total FROM invoice_payments WHERE invoice_id = ? AND status = 'approved' AND id != ?`,
      [payment.invoice_id, id]
    );
    const prevPaid = parseFloat(prevPayments[0]?.total || 0);
    const totalPaid = prevPaid + approvedAmount;
    const newBalance = Math.max(0, totalFee - totalPaid);
    const invoiceStatus = newBalance <= 0 ? 'paid' : 'partial';

    await connection.beginTransaction();

    // 1. Approve the payment record
    await connection.query(
      `UPDATE invoice_payments SET status = 'approved', amount = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [approvedAmount, adminId, id]
    );

    // 2. Update invoice totals
    await connection.query(
      `UPDATE invoices SET amount_paid = ?, balance_due = ?, balance_amount = ?, payment_status = ?, last_payment_date = NOW() WHERE id = ?`,
      [totalPaid, newBalance, newBalance, invoiceStatus, payment.invoice_id]
    );

    // 3. Activate enrollment
    await connection.query(
      `UPDATE enrollments SET status = 'active' WHERE student_id = ? AND course_id = ? AND status = 'suspended_offline'`,
      [payment.student_id, payment.course_id]
    );

    await connection.commit();

    // 4. Notify student
    try {
      const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [payment.student_id]);
      const [courseRows] = await pool.query('SELECT title FROM courses WHERE id = ?', [payment.course_id]);
      const studentName = userRows[0]?.name || 'Student';
      const courseTitle = courseRows[0]?.title || 'your course';

      await createNotification({
        userId: payment.student_id,
        type: 'system',
        title: '✅ Payment Approved!',
        body: `Hi ${studentName}, your payment of ₹${approvedAmount.toLocaleString()} for "${courseTitle}" has been approved. Your enrollment is now active!${newBalance > 0 ? ` Remaining balance: ₹${newBalance.toLocaleString()}.` : ''}`,
        link: '/dashboard/student/payments',
        emailNotify: true
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    res.json({ message: 'Payment approved and enrollment activated', invoiceStatus, totalPaid, newBalance });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

// PUT /api/admin/finance/offline-payments/:id/reject
router.put('/offline-payments/:id/reject', authenticateJWT, hasAccess, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

    const [payments] = await connection.query(`
      SELECT ip.*, i.student_id, i.course_id
      FROM invoice_payments ip
      JOIN invoices i ON ip.invoice_id = i.id
      WHERE ip.id = ?
    `, [id]);

    if (payments.length === 0) return res.status(404).json({ message: 'Payment not found' });
    const payment = payments[0];

    await connection.beginTransaction();

    // 1. Reject payment record
    await connection.query(
      `UPDATE invoice_payments SET status = 'rejected', remarks = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
      [reason, adminId, id]
    );

    await connection.commit();

    // 2. Notify student
    try {
      const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [payment.student_id]);
      const [courseRows] = await pool.query('SELECT title FROM courses WHERE id = ?', [payment.course_id]);
      const studentName = userRows[0]?.name || 'Student';
      const courseTitle = courseRows[0]?.title || 'your course';

      await createNotification({
        userId: payment.student_id,
        type: 'system',
        title: '❌ Payment Could Not Be Verified',
        body: `Hi ${studentName}, unfortunately your offline payment for "${courseTitle}" could not be verified. Reason: ${reason}. Please re-submit with a valid receipt or contact support.`,
        link: '/dashboard/student/payments',
        emailNotify: true
      });
    } catch (notifErr) {
      console.error('Notification error:', notifErr);
    }

    res.json({ message: 'Payment rejected and student notified' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

export default router;

