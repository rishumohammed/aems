import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import enrollmentService from '../services/enrollment.service.js';
import paymentService from '../services/payment.service.js';
import { pool } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// 1. Student Self-Enroll (Public/Student)
router.post('/checkout', authenticateJWT, async (req, res) => {
  try {
    const { courseId, paymentOption, customAmount } = req.body;
    const studentId = req.user.id;

    // Get course details
    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (courses.length === 0) return res.status(404).json({ message: 'Course not found' });
    const course = courses[0];

    if (course.status !== 'published') {
      return res.status(400).json({ message: 'Course is not available for enrollment' });
    }

    // Check if already enrolled
    const [existing] = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? AND status IN ("active", "completed")',
      [studentId, courseId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You are already enrolled in this course', code: 'ALREADY_ENROLLED' });
    }

    if (course.price_type !== 'fixed') {
      return res.status(400).json({ message: 'Custom price courses require agent assistance' });
    }

    // HANDLE FREE COURSES
    if (parseFloat(course.price) === 0) {
      const result = await enrollmentService.enrollStudent({
        studentData: { id: studentId },
        courseId,
        pricing: { amount: 0 },
        payment: { mode: 'free', amountPaid: 0 }
      });
      return res.json({ success: true, message: 'Enrolled successfully for free!', ...result });
    }

    // Calculate partial payment options
    let checkoutAmount = parseFloat(course.price);
    if (paymentOption === 'half') {
      checkoutAmount = parseFloat(course.price) / 2;
    } else if (paymentOption === 'custom') {
      const amt = parseFloat(customAmount);
      if (isNaN(amt)) {
        return res.status(400).json({ message: 'Custom amount must be a valid number' });
      }

      const minAmount = Math.min(course.price, Math.max(500, course.price * 0.2));
      if (amt < minAmount) {
        return res.status(400).json({ message: `Minimum payment amount is ₹${minAmount.toLocaleString()}` });
      }
      if (amt > course.price) {
        return res.status(400).json({ message: 'Custom amount cannot exceed the course fee' });
      }
      checkoutAmount = amt;
    }

    // Create Razorpay Order for paid courses
    try {
      const { key_id, key_secret } = await paymentService.getKeys();
      if (!key_id || key_id === 'rzp_test_placeholder' || !key_secret || key_secret === 'placeholder_secret') {
        return res.status(400).json({
          message: 'Razorpay payment gateway is not configured. Please configure Razorpay Key ID and Secret in Admin Settings.'
        });
      }

      const order = await paymentService.createOrder(checkoutAmount, 'INR', `enroll_${studentId.slice(0, 8)}`);
      res.json({
        key_id,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        course_title: course.title
      });
    } catch (paymentError) {
      console.error('Razorpay Order Creation Failed:', paymentError);
      res.status(500).json({ message: paymentError.message || 'Razorpay order creation failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Verify Payment & Finalize Enrollment (Public/Student)
router.post('/verify-payment', authenticateJWT, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    // Verify signature
    const isValid = await paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Retrieve order details to get actual amountPaid securely
    const orderDetails = await paymentService.getOrder(razorpay_order_id);
    const amountPaid = orderDetails.amount / 100;

    // Get course details for pricing
    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    const course = courses[0];

    // Finalize enrollment
    const result = await enrollmentService.enrollStudent({
      studentData: { id: req.user.id },
      courseId,
      pricing: { amount: course.price },
      payment: {
        mode: 'online',
        amountPaid: amountPaid,
        gatewayOrderId: razorpay_order_id
      }
    });

    res.json({ message: 'Enrollment successful', ...result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check enrollment status (Public/Student)
router.get('/check/:courseId', authenticateJWT, async (req, res) => {
  try {
    const [existing] = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? AND status IN ("active", "completed")',
      [req.user.id, req.params.courseId]
    );
    res.json({ isEnrolled: existing.length > 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Manual Enrollment (Admin/CRM Agent)
router.post('/manual', authenticateJWT, authorizeRoles('super_admin', 'crm_agent'), async (req, res) => {
  try {
    const { student_id, course_id, course_ids, price, payment_mode, amount_paid, reference, notes } = req.body;

    const idsToEnroll = course_ids || (course_id ? [course_id] : []);
    if (idsToEnroll.length === 0) return res.status(400).json({ message: 'No courses selected' });

    let remainingPayment = parseFloat(amount_paid) || 0;
    const bundlePrice = parseFloat(price) || 0;
    const results = [];

    // Fetch original prices for all courses to calculate proportional discount
    const [courses] = await pool.query('SELECT id, price FROM courses WHERE id IN (?)', [idsToEnroll]);
    const courseMap = {};
    let originalTotal = 0;
    courses.forEach(c => {
      courseMap[c.id] = parseFloat(c.price) || 0;
      originalTotal += courseMap[c.id];
    });

    const discountFactor = originalTotal > 0 ? bundlePrice / originalTotal : 1;

    for (const cid of idsToEnroll) {
      const originalCoursePrice = courseMap[cid] || 0;
      const finalCoursePrice = originalTotal > 0 ? originalCoursePrice * discountFactor : bundlePrice / idsToEnroll.length;
      
      let allocatedAmount = Math.min(finalCoursePrice, remainingPayment);
      if (allocatedAmount < 0) allocatedAmount = 0;
      
      // If this is the last course and there's remaining payment, just put it all here to avoid penny rounding issues
      if (cid === idsToEnroll[idsToEnroll.length - 1] && remainingPayment > allocatedAmount) {
        allocatedAmount = remainingPayment;
      }

      remainingPayment -= allocatedAmount;

      const result = await enrollmentService.enrollStudent({
        studentData: { id: student_id },
        courseId: cid,
        pricing: { amount: parseFloat(finalCoursePrice.toFixed(2)) },
        payment: {
          mode: payment_mode === 'online' ? 'online' : 'offline',
          amountPaid: parseFloat(allocatedAmount.toFixed(2)),
          offlineType: payment_mode,
          reference,
          notes
        }
      });
      results.push(result);
    }

    res.json({ message: 'Manual enrollment successful', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
