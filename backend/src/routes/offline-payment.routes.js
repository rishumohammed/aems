import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { pool } from '../db/connection.js';
import { createNotification } from '../services/notification.service.js';

const router = express.Router();

// ─── File Upload Setup ────────────────────────────────────────────────────────
const proofStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/payment_proofs';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const proofUpload = multer({
  storage: proofStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only JPG, PNG, and PDF files are allowed'));
  }
});

// ─── Student: Submit Offline Payment ─────────────────────────────────────────
// POST /api/enrollments/checkout-offline
router.post('/checkout-offline', authenticateJWT, proofUpload.single('proof'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { courseId, paymentMode, referenceNumber, paymentDate, amountPaid, remarks } = req.body;
    const studentId = req.user.id;

    if (!courseId || !paymentMode || !amountPaid) {
      return res.status(400).json({ message: 'courseId, paymentMode, and amountPaid are required' });
    }

    // Validate amount
    const amount = parseFloat(amountPaid);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount paid' });
    }

    // Get course
    const [courses] = await connection.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (courses.length === 0) return res.status(404).json({ message: 'Course not found' });
    const course = courses[0];

    if (course.status !== 'published') {
      return res.status(400).json({ message: 'Course is not available for enrollment' });
    }

    // Check if already enrolled (active)
    const [existing] = await connection.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? AND status IN ("active", "completed")',
      [studentId, courseId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You are already enrolled in this course', code: 'ALREADY_ENROLLED' });
    }

    const coursePrice = parseFloat(course.price);
    const balanceDue = Math.max(0, coursePrice - amount);
    const paymentStatus = balanceDue <= 0 ? 'paid' : (amount > 0 ? 'partial' : 'pending');

    const proofPath = req.file ? `/uploads/payment_proofs/${req.file.filename}` : null;

    await connection.beginTransaction();

    // Create enrollment with suspended_offline status (pending admin approval)
    const enrollmentId = uuidv4();
    await connection.query(
      'INSERT INTO enrollments (id, student_id, course_id, status) VALUES (?, ?, ?, "suspended_offline")',
      [enrollmentId, studentId, courseId]
    );

    // Create Invoice
    const invoiceId = uuidv4();
    await connection.query(
      `INSERT INTO invoices (id, student_id, course_id, amount, total_fee, amount_paid, balance_due, balance_amount, payment_mode, payment_status, payment_reference)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'offline', ?, ?)`,
      [invoiceId, studentId, courseId, coursePrice, coursePrice, 0, coursePrice, coursePrice, 'pending', referenceNumber || null]
    );

    // Create payment record with status = 'pending' (awaiting admin approval)
    const paymentId = uuidv4();
    await connection.query(
      `INSERT INTO invoice_payments (id, invoice_id, amount, mode, reference, paid_at, installment_number, status, proof_path, remarks)
       VALUES (?, ?, ?, ?, ?, ?, 1, 'pending', ?, ?)`,
      [
        paymentId,
        invoiceId,
        amount,
        paymentMode, // bank_transfer | upi | cash | cheque
        referenceNumber || null,
        paymentDate ? new Date(paymentDate) : new Date(),
        proofPath,
        remarks || null
      ]
    );

    await connection.commit();

    // Notify student
    try {
      const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [studentId]);
      const studentName = userRows[0]?.name || 'Student';
      await createNotification({
        userId: studentId,
        type: 'system',
        title: 'Payment Submitted — Pending Verification',
        message: `Hi ${studentName}, your offline payment of ₹${amount.toLocaleString()} for "${course.title}" has been received. Our team will verify it shortly.`,
        link: '/dashboard/student/payments',
        emailNotify: true
      });

      // Notify Admins
      const [admins] = await pool.query('SELECT id FROM users WHERE role = "super_admin" AND status = "active"');
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: 'info',
          title: 'Offline Payment Submitted',
          message: `${studentName} has submitted an offline payment of ₹${amount.toLocaleString()} for "${course.title}".`,
          link: '/dashboard/admin/finance/offline-payments',
          emailNotify: false
        });
      }
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr);
    }

    res.json({
      success: true,
      message: 'Offline payment submitted successfully. Enrollment will be activated after admin verification.',
      paymentId,
      enrollmentId,
      invoiceId,
      status: 'pending'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Offline checkout error:', error);
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

export default router;
