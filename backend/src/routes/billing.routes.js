import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { pool } from '../db/connection.js';
import invoiceService from '../services/invoice.service.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// Student: Get my invoices
router.get('/my-invoices', authenticateJWT, authorizeRoles('student'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, c.title as course_title 
       FROM invoices i 
       LEFT JOIN courses c ON i.course_id = c.id 
       WHERE i.student_id = ? 
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student: Get my invoice payments
router.get('/invoices/:id/payments', authenticateJWT, authorizeRoles('student'), async (req, res) => {
  try {
    // Verify invoice ownership
    const [invoices] = await pool.query(
      'SELECT id FROM invoices WHERE id = ? AND student_id = ?',
      [req.params.id, req.user.id]
    );
    if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });

    const [rows] = await pool.query(
      `SELECT * FROM invoice_payments WHERE invoice_id = ? ORDER BY paid_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student: Create Razorpay Order
router.post('/invoices/:id/pay', authenticateJWT, authorizeRoles('student'), async (req, res) => {
  try {
    const [invoices] = await pool.query(
      'SELECT balance_due, invoice_number FROM invoices WHERE id = ? AND student_id = ?',
      [req.params.id, req.user.id]
    );

    if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const invoice = invoices[0];

    if (invoice.balance_due <= 0) return res.status(400).json({ message: 'Invoice already paid' });

    const options = {
      amount: Math.round(invoice.balance_due * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: invoice.invoice_number,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Student: Verify Payment
router.post('/payments/verify', authenticateJWT, authorizeRoles('student'), async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoice_id } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    try {
      // Get payment details from Razorpay to find amount
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      const amount = payment.amount / 100;

      const result = await invoiceService.recordPayment(invoice_id, amount, 'card', razorpay_payment_id);
      res.json({ message: "Payment verified successfully", ...result });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(400).json({ message: "Invalid signature" });
  }
});

export default router;
