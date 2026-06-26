import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/connection.js';
import { generateInvoicePDF } from '../utils/pdf-generator.js';
import { createNotification } from './notification.service.js';

class InvoiceService {
  async generateInvoiceNumber() {
    const now = new Date();
    const yearMonth = now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of invoices for this month to generate sequential number
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM invoices WHERE invoice_number LIKE ?`,
      [`INV-${yearMonth}-%`]
    );
    
    const nextNum = (rows[0].count + 1).toString().padStart(4, '0');
    return `INV-${yearMonth}-${nextNum}`;
  }

  async createInvoice(studentId, courseId, amount) {
    const invoiceId = uuidv4();
    const invoiceNumber = await this.generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Default 7 days due date

    await pool.query(
      `INSERT INTO invoices (id, invoice_number, student_id, course_id, amount, total_fee, balance_due, balance_amount, due_date, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [invoiceId, invoiceNumber, studentId, courseId, amount, amount, amount, amount, dueDate]
    );

    // Generate PDF asynchronously (non-blocking)
    this.generatePDF(invoiceId).catch(err => {
      console.error(`Failed to generate PDF asynchronously for invoice ${invoiceId}:`, err);
    });

    return { invoiceId, invoiceNumber };
  }

  async generatePDF(invoiceId) {
    const [invoices] = await pool.query(
      `SELECT i.*, u.name as student_name, u.email as student_email, u.phone as student_phone, c.title as course_title
       FROM invoices i
       JOIN users u ON i.student_id = u.id
       LEFT JOIN courses c ON i.course_id = c.id
       WHERE i.id = ?`,
      [invoiceId]
    );

    if (invoices.length === 0) throw new Error('Invoice not found');
    const invoice = invoices[0];

    const pdfDir = path.join(process.cwd(), 'uploads', 'invoices');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfFilename = `${invoice.invoice_number || invoice.id}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFilename);
    const pdfUrl = `/uploads/invoices/${pdfFilename}`;
    const [configRows] = await pool.query('SELECT `key`, `value` FROM system_config WHERE `key` IN ("institute_name", "contact_address", "contact_phone", "contact_email", "app_logo", "invoice_header_color")');
    const instituteInfo = {};
    configRows.forEach(r => {
      if (r.key === 'institute_name')       instituteInfo.name              = r.value;
      if (r.key === 'contact_address')      instituteInfo.address           = r.value;
      if (r.key === 'contact_phone')        instituteInfo.phone             = r.value;
      if (r.key === 'contact_email')        instituteInfo.email             = r.value;
      if (r.key === 'app_logo')             instituteInfo.logo_url          = r.value;
      if (r.key === 'invoice_header_color') instituteInfo.header_color      = r.value;
    });

    await generateInvoicePDF(
      invoice,
      { name: invoice.student_name, email: invoice.student_email, phone: invoice.student_phone },
      { title: invoice.course_title || 'General Enrollment' },
      instituteInfo,
      pdfPath
    );

    await pool.query('UPDATE invoices SET pdf_path = ? WHERE id = ?', [pdfUrl, invoiceId]);

    return pdfUrl;
  }

  async recordPayment(invoiceId, amount, mode, reference) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [invoices] = await connection.query('SELECT * FROM invoices WHERE id = ? FOR UPDATE', [invoiceId]);
      if (invoices.length === 0) throw new Error('Invoice not found');
      const invoice = invoices[0];

      if (invoice.payment_status === 'voided') throw new Error('Cannot pay a voided invoice');

      const [paymentsCount] = await connection.query(
        'SELECT COUNT(*) as count FROM invoice_payments WHERE invoice_id = ?',
        [invoiceId]
      );
      const nextInstallmentNumber = paymentsCount[0].count + 1;

      const paymentId = uuidv4();
      await connection.query(
        `INSERT INTO invoice_payments (id, invoice_id, amount, mode, reference, installment_number)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [paymentId, invoiceId, amount, mode, reference, nextInstallmentNumber]
      );

      const newAmountPaid = parseFloat(invoice.amount_paid) + parseFloat(amount);
      const newBalanceDue = parseFloat(invoice.amount) - newAmountPaid;
      const newStatus = newBalanceDue <= 0 ? 'paid' : 'partial';

      await connection.query(
        `UPDATE invoices 
         SET amount_paid = ?, balance_due = ?, balance_amount = ?, payment_status = ?, last_payment_date = NOW(), payment_reference = ?
         WHERE id = ?`,
        [newAmountPaid, newBalanceDue, newBalanceDue, newStatus, reference || null, invoiceId]
      );

      await connection.commit();
      
      // Regenerate PDF to reflect payment asynchronously (non-blocking)
      this.generatePDF(invoiceId).catch(err => {
        console.error(`Failed to regenerate PDF asynchronously for invoice ${invoiceId}:`, err);
      });

      // AFTER COMMIT: Send Notifications & Generate Certificates if fully paid
      try {
        const [details] = await pool.query(`
          SELECT i.*, u.name as student_name, u.email as student_email, c.title as course_title
          FROM invoices i
          JOIN users u ON i.student_id = u.id
          LEFT JOIN courses c ON i.course_id = c.id
          WHERE i.id = ?
        `, [invoiceId]);

        if (details.length > 0) {
          const detail = details[0];
          let notifTitle = '';
          let notifBody = '';

          if (newStatus === 'paid') {
            notifTitle = 'Course Fully Paid: ' + detail.course_title;
            notifBody = `Hi ${detail.student_name}, your payment for ${detail.course_title} is now complete. Total paid: ₹${newAmountPaid.toLocaleString()}.`;
          } else if (newStatus === 'partial') {
            notifTitle = invoice.amount_paid > 0 ? 'Balance Payment Received' : 'Payment Received';
            notifBody = `Hi ${detail.student_name}, we have received your payment of ₹${amount.toLocaleString()} for ${detail.course_title}. Your remaining balance is ₹${newBalanceDue.toLocaleString()}.`;
          } else {
            notifTitle = 'Payment Received';
            notifBody = `Hi ${detail.student_name}, we have received your payment of ₹${amount.toLocaleString()} for ${detail.course_title}.`;
          }

          await createNotification({
            userId: invoice.student_id,
            type: 'system',
            title: notifTitle,
            body: notifBody,
            link: '/dashboard/student/payments',
            emailNotify: true
          });
        }

        // Auto-generate certificate if fully paid and passed
        if (newStatus === 'paid') {
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
              const certService = (await import('./certificate.service.js')).default;
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
      } catch (postCommitErr) {
        console.error('Error during post-commit payment actions:', postCommitErr);
      }

      return { paymentId, newBalanceDue, newStatus };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async voidInvoice(invoiceId, reason) {
    // In a real app, we'd log the reason. For now, just update status.
    await pool.query("UPDATE invoices SET payment_status = 'voided' WHERE id = ?", [invoiceId]);
    return true;
  }
}

export default new InvoiceService();
