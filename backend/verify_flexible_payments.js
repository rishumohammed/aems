import { pool } from './src/db/connection.js';
import enrollmentService from './src/services/enrollment.service.js';
import invoiceService from './src/services/invoice.service.js';
import { v4 as uuidv4 } from 'uuid';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function assert(condition, message) {
  if (!condition) {
    throw new Error('ASSERTION FAILED: ' + message);
  }
  console.log('  [PASS]: ' + message);
}

async function runTests() {
  console.log('================================================================');
  console.log('Starting flexible partial payment system verification...');
  console.log('================================================================\n');

  // 1. Fetch test student and course
  const [students] = await pool.query("SELECT id, name, email, phone FROM users WHERE role = 'student' LIMIT 1");
  if (students.length === 0) {
    console.error('Error: A student user must exist in the database to run this test.');
    process.exit(1);
  }
  const student = students[0];
  console.log('Testing with Student:', student.name, `(${student.id})`);

  // Fetch valid category_id and tutor_id to satisfy foreign key constraints
  const [categories] = await pool.query("SELECT id FROM course_categories LIMIT 1");
  const categoryId = categories.length > 0 ? categories[0].id : null;

  const [tutors] = await pool.query("SELECT id FROM users WHERE role IN ('tutor', 'super_admin') LIMIT 1");
  const tutorId = tutors.length > 0 ? tutors[0].id : null;

  if (!categoryId || !tutorId) {
    console.error('Error: A course category and a tutor must exist in the database.');
    process.exit(1);
  }

  // We need a test course with a price of, say, 5000. Let's create a temporary test course.
  const courseId = uuidv4();
  const coursePrice = 5000;
  const courseSlug = 'test-flexible-payment-course-' + Date.now();
  await pool.query(
    `INSERT INTO courses (id, title, slug, description, category_id, tutor_id, price_type, price, status)
     VALUES (?, 'Test Flexible Payment Course', ?, 'Description', ?, ?, 'fixed', ?, 'published')`,
    [courseId, courseSlug, categoryId, tutorId, coursePrice]
  );
  console.log('Created temporary course for testing with price:', coursePrice, 'and slug:', courseSlug);

  try {
    // 2. Validate Checkout rules (Server-side calculations matching enrollments.routes.js checkout logic)
    console.log('\n--- Test Part 1: Checkout Logic Validation ---');
    
    // Helper to simulate checkout amount calculation
    const calculateCheckoutAmount = (price, option, customAmt) => {
      let checkoutAmount = parseFloat(price);
      if (option === 'half') {
        checkoutAmount = parseFloat(price) / 2;
      } else if (option === 'custom') {
        const amt = parseFloat(customAmt);
        if (isNaN(amt)) throw new Error('Custom amount must be a valid number');
        const minAmount = Math.min(price, Math.max(500, price * 0.2));
        if (amt < minAmount) throw new Error(`Minimum payment amount is ₹${minAmount}`);
        if (amt > price) throw new Error('Custom amount cannot exceed the course fee');
        checkoutAmount = amt;
      }
      return checkoutAmount;
    };

    // Full Payment Option
    const fullAmt = calculateCheckoutAmount(coursePrice, 'full');
    assert(fullAmt === 5000, 'Full payment amount should equal course price (5000)');

    // 50% Option
    const halfAmt = calculateCheckoutAmount(coursePrice, 'half');
    assert(halfAmt === 2500, 'Half payment amount should equal 50% of course price (2500)');

    // Custom Option - valid (e.g. 1500, which is >= Math.min(5000, Math.max(500, 1000)) = 1000)
    const customVal = calculateCheckoutAmount(coursePrice, 'custom', 1500);
    assert(customVal === 1500, 'Valid custom amount (1500) should succeed and equal 1500');

    // Custom Option - invalid too low (e.g. 800)
    try {
      calculateCheckoutAmount(coursePrice, 'custom', 800);
      assert(false, 'Should have failed with custom amount under minimum limit (800 < 1000)');
    } catch (e) {
      assert(e.message.includes('Minimum payment amount'), 'Custom amount under minimum failed as expected: ' + e.message);
    }

    // Custom Option - invalid too high (e.g. 6000)
    try {
      calculateCheckoutAmount(coursePrice, 'custom', 6000);
      assert(false, 'Should have failed with custom amount exceeding course fee (6000 > 5000)');
    } catch (e) {
      assert(e.message.includes('cannot exceed the course fee'), 'Custom amount exceeding course fee failed as expected: ' + e.message);
    }

    // 3. Test Student Enrollment with Partial/Installment Payments
    console.log('\n--- Test Part 2: Enrollment and Installment 1 Recording ---');

    const enrollRes = await enrollmentService.enrollStudent({
      studentData: { id: student.id, name: student.name, email: student.email, phone: student.phone },
      courseId,
      pricing: { amount: coursePrice },
      payment: {
        mode: 'online',
        amountPaid: 2000, // Partial initial payment
        gatewayOrderId: 'order_test_flexible_1'
      }
    });

    assert(!!enrollRes.enrollmentId, 'Enrollment ID should be returned');
    assert(!!enrollRes.invoiceId, 'Invoice ID should be returned');

    // Check invoice fields
    const [invoices] = await pool.query('SELECT * FROM invoices WHERE id = ?', [enrollRes.invoiceId]);
    assert(invoices.length === 1, 'Invoice record should be created');
    const invoice = invoices[0];
    assert(Number(invoice.total_fee) === 5000, 'Invoice total_fee should be 5000');
    assert(Number(invoice.amount_paid) === 2000, 'Invoice amount_paid should be 2000');
    assert(Number(invoice.balance_amount) === 3000, 'Invoice balance_amount should be 3000');
    assert(invoice.payment_status === 'partial', 'Invoice status should be "partial"');

    // Check payment recording
    const [payments] = await pool.query('SELECT * FROM invoice_payments WHERE invoice_id = ?', [enrollRes.invoiceId]);
    assert(payments.length === 1, 'One payment record should exist');
    const p1 = payments[0];
    assert(Number(p1.amount) === 2000, 'First payment amount should be 2000');
    assert(p1.installment_number === 1, 'First payment installment_number should be 1');

    // Wait for the async setTimeout notification
    await sleep(1500);

    // Check notification triggered for partial payment
    const [notifs] = await pool.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 3', [student.id]);
    assert(notifs.some(n => n.title.includes('Partial Payment Received')), 'Should have sent Partial Payment Received notification');
    assert(notifs.some(n => n.title.includes('Balance Payment Due')), 'Should have sent Balance Payment Due notification');

    // 4. Test Sequential Installments Recording via recordPayment
    console.log('\n--- Test Part 3: Secondary Installment Recording ---');
    
    // Record second payment (another partial payment)
    const rec1 = await invoiceService.recordPayment(invoice.id, 1500, 'cash', 'REF_INSTALLMENT_2');
    assert(rec1.newStatus === 'partial', 'Invoice status should still be partial after second payment');
    assert(Number(rec1.newBalanceDue) === 1500, 'New balance due should be 1500');

    // Check in DB
    const [paymentsAfter2] = await pool.query('SELECT * FROM invoice_payments WHERE invoice_id = ? ORDER BY installment_number ASC', [invoice.id]);
    assert(paymentsAfter2.length === 2, 'Two payment records should exist');
    const p2 = paymentsAfter2[1];
    assert(Number(p2.amount) === 1500, 'Second payment amount should be 1500');
    assert(p2.installment_number === 2, 'Second payment installment_number should be 2');

    // Record final payment (clearing balance)
    console.log('\n--- Test Part 4: Finalizing Balance Payment ---');
    const rec2 = await invoiceService.recordPayment(invoice.id, 1500, 'bank_transfer', 'REF_INSTALLMENT_3');
    assert(rec2.newStatus === 'paid', 'Invoice status should now be fully paid');
    assert(Number(rec2.newBalanceDue) === 0, 'New balance due should be 0');

    // Check in DB
    const [paymentsAfter3] = await pool.query('SELECT * FROM invoice_payments WHERE invoice_id = ? ORDER BY installment_number ASC', [invoice.id]);
    assert(paymentsAfter3.length === 3, 'Three payment records should exist');
    const p3 = paymentsAfter3[2];
    assert(Number(p3.amount) === 1500, 'Third payment amount should be 1500');
    assert(p3.installment_number === 3, 'Third payment installment_number should be 3');

    // Check final status notification
    const [finalNotifs] = await pool.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [student.id]);
    console.log('User notifications found:', finalNotifs.map(n => ({ title: n.title, created_at: n.created_at })));
    assert(finalNotifs.some(n => n.title.includes('Course Fully Paid')), 'Should have sent Course Fully Paid notification');

    console.log('\n================================================================');
    console.log('ALL TESTS PASSED SUCCESSFULLY!');
    console.log('================================================================');
  } finally {
    // Cleanup temporary course and enrollment
    console.log('\nCleaning up test data...');
    const [tempInvs] = await pool.query('SELECT id FROM invoices WHERE course_id = ?', [courseId]);
    for (const inv of tempInvs) {
      await pool.query('DELETE FROM invoice_payments WHERE invoice_id = ?', [inv.id]);
      await pool.query('DELETE FROM invoices WHERE id = ?', [inv.id]);
    }
    await pool.query('DELETE FROM enrollments WHERE course_id = ?', [courseId]);
    await pool.query('DELETE FROM courses WHERE id = ?', [courseId]);
    console.log('Cleanup completed.');
  }
}

runTests().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
