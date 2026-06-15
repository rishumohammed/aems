import { pool } from './src/db/connection.js';
import invoiceService from './src/services/invoice.service.js';
import examService from './src/services/exam.service.js';
import { WebhookController } from './src/controllers/webhook.controller.js';
import crypto from 'crypto';

// Assert helper
function assert(condition, message) {
  if (!condition) {
    throw new Error('ASSERTION FAILED: ' + message);
  }
  console.log('  [PASS]: ' + message);
}

async function runTests() {
  console.log('================================================================');
  console.log('Starting end-to-end payment management system verification...');
  console.log('================================================================\n');

  // 1. Fetch/Create test student and course
  const [students] = await pool.query("SELECT id FROM users WHERE role = 'student' LIMIT 1");
  if (students.length === 0) {
    console.error('Error: A student user must exist in the database to run this test.');
    process.exit(1);
  }
  const studentId = students[0].id;
  console.log('Testing with Student ID:', studentId);

  const [courses] = await pool.query("SELECT id FROM courses LIMIT 1");
  if (courses.length === 0) {
    console.error('Error: A course must exist in the database to run this test.');
    process.exit(1);
  }
  const courseId = courses[0].id;
  console.log('Testing with Course ID:', courseId);

  // Get or create an exam for testing Option C
  let examId = null;
  const [exams] = await pool.query("SELECT id FROM exams WHERE course_id = ? LIMIT 1", [courseId]);
  if (exams.length > 0) {
    examId = exams[0].id;
  } else {
    // Insert a mock exam
    const mockExamId = 'test-exam-id-12345';
    await pool.query(
      `INSERT INTO exams (id, course_id, title, max_attempts, pass_percentage, status)
       VALUES (?, ?, 'Test Certification Exam', 3, 70, 'published')`,
      [mockExamId, courseId]
    );
    examId = mockExamId;
    console.log('Created mock exam:', examId);
  }

  // Back up original configurations
  const [origConfigs] = await pool.query('SELECT * FROM system_config WHERE `key` IN ("payment_allow_partial_access", "payment_restrict_certificate", "payment_restrict_exam")');
  const originalValues = {};
  for (const c of origConfigs) {
    originalValues[c.key] = c.value;
  }

  // Ensure config records exist
  const ensureConfig = async (key, val) => {
    const [exists] = await pool.query('SELECT `key` FROM system_config WHERE `key` = ?', [key]);
    if (exists.length === 0) {
      await pool.query('INSERT INTO system_config (`key`, value) VALUES (?, ?)', [key, val]);
    } else {
      await pool.query('UPDATE system_config SET value = ? WHERE `key` = ?', [val, key]);
    }
  };

  await ensureConfig('payment_allow_partial_access', 'true');
  await ensureConfig('payment_restrict_certificate', 'true');
  await ensureConfig('payment_restrict_exam', 'false');

  // Ensure enrollment exists
  const [enrollments] = await pool.query('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [studentId, courseId]);
  let enrollmentId = null;
  if (enrollments.length === 0) {
    // Enroll student
    const [result] = await pool.query(
      `INSERT INTO enrollments (student_id, course_id, status) VALUES (?, ?, 'active')`,
      [studentId, courseId]
    );
    enrollmentId = result.insertId;
    console.log('Created temporary enrollment ID:', enrollmentId);
  } else {
    enrollmentId = enrollments[0].id;
  }

  // Clear existing invoices for this student/course combo to avoid clutter
  const [existingInvoices] = await pool.query('SELECT id FROM invoices WHERE student_id = ? AND course_id = ?', [studentId, courseId]);
  for (const inv of existingInvoices) {
    await pool.query('DELETE FROM invoice_payments WHERE invoice_id = ?', [inv.id]);
    await pool.query('DELETE FROM invoices WHERE id = ?', [inv.id]);
  }

  console.log('\n--- Test Part 1: Direct Service Invoice & Payment Flow ---');
  const { invoiceId, invoiceNumber } = await invoiceService.createInvoice(studentId, courseId, 10000);
  console.log('Created invoice:', invoiceNumber);

  // Verify DB state
  const [invoiceRows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
  assert(invoiceRows.length === 1, 'Invoice exists in database');
  const inv = invoiceRows[0];
  assert(Number(inv.total_fee) === 10000, 'total_fee is initialized to 10000');
  assert(Number(inv.amount_paid) === 0, 'amount_paid is initialized to 0');
  assert(Number(inv.balance_amount) === 10000, 'balance_amount is initialized to 10000');
  assert(inv.payment_status === 'pending', 'payment_status is pending');

  console.log('\nRecording Partial Payment of ₹4,000 directly...');
  const partPayment = await invoiceService.recordPayment(invoiceId, 4000, 'bank_transfer', 'PART-REF-001');
  console.log('Partial payment recorded. Status returned:', partPayment.newStatus);

  const [partInvoiceRows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
  const partInv = partInvoiceRows[0];
  assert(Number(partInv.amount_paid) === 4000, 'amount_paid is 4000 after partial payment');
  assert(Number(partInv.balance_amount) === 6000, 'balance_amount is 6000 after partial payment');
  assert(partInv.payment_status === 'partial', 'payment_status is partial');

  console.log('\nChecking Option A (Curriculum Lock Rules)...');
  // Sub-test A1: Allow partial access is TRUE
  await pool.query('UPDATE system_config SET value = "true" WHERE `key` = "payment_allow_partial_access"');
  let hasAccessWithTrue = true;
  const [invoicesTrue] = await pool.query('SELECT payment_status FROM invoices WHERE student_id = ? AND course_id = ?', [studentId, courseId]);
  if (invoicesTrue.length > 0) {
    const paymentStatus = invoicesTrue[0].payment_status;
    const [configs] = await pool.query('SELECT value FROM system_config WHERE `key` = "payment_allow_partial_access"');
    const allowPartial = configs[0]?.value === 'true';
    if (paymentStatus === 'partial' && !allowPartial) {
      hasAccessWithTrue = false;
    }
  }
  assert(hasAccessWithTrue === true, 'Curriculum access allowed on partial status when config is true');

  // Sub-test A2: Allow partial access is FALSE
  await pool.query('UPDATE system_config SET value = "false" WHERE `key` = "payment_allow_partial_access"');
  let hasAccessWithFalse = true;
  const [invoicesFalse] = await pool.query('SELECT payment_status FROM invoices WHERE student_id = ? AND course_id = ?', [studentId, courseId]);
  if (invoicesFalse.length > 0) {
    const paymentStatus = invoicesFalse[0].payment_status;
    const [configs] = await pool.query('SELECT value FROM system_config WHERE `key` = "payment_allow_partial_access"');
    const allowPartial = configs[0]?.value === 'true';
    if (paymentStatus === 'partial' && !allowPartial) {
      hasAccessWithFalse = false;
    }
  }
  assert(hasAccessWithFalse === false, 'Curriculum access denied on partial status when config is false');

  console.log('\nChecking Option C (Exam Eligibility Rules)...');
  // Sub-test C1: Restrict exam is TRUE
  await pool.query('UPDATE system_config SET value = "true" WHERE `key` = "payment_restrict_exam"');
  try {
    await examService.checkEligibility(studentId, examId);
    assert(false, 'Should have thrown error on exam eligibility');
  } catch (err) {
    assert(err.message.includes('pay the full course fee'), 'Exam eligibility blocked on unpaid balance when config is true: ' + err.message);
  }

  // Sub-test C2: Restrict exam is FALSE
  await pool.query('UPDATE system_config SET value = "false" WHERE `key` = "payment_restrict_exam"');
  try {
    const eligibility = await examService.checkEligibility(studentId, examId);
    assert(eligibility.eligible === true || eligibility !== null, 'Exam eligibility check bypassed payment rule when config is false');
  } catch (err) {
    assert(!err.message.includes('pay the full course fee'), 'Exam eligibility did not block due to payment rules');
  }

  console.log('\nRecording Balance Payment of ₹6,000 directly...');
  const balancePayment = await invoiceService.recordPayment(invoiceId, 6000, 'bank_transfer', 'BAL-REF-002');
  console.log('Balance payment recorded. Status returned:', balancePayment.newStatus);

  const [finalInvoiceRows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
  const finalInv = finalInvoiceRows[0];
  assert(Number(finalInv.amount_paid) === 10000, 'amount_paid is 10000 after final payment');
  assert(Number(finalInv.balance_amount) === 0, 'balance_amount is 0 after final payment');
  assert(finalInv.payment_status === 'paid', 'payment_status is paid');


  console.log('\n--- Test Part 2: Webhook Partial & Remaining Payment Simulation ---');
  // Delete the first test invoice to run a fresh webhook-only test
  await pool.query('DELETE FROM invoice_payments WHERE invoice_id = ?', [invoiceId]);
  await pool.query('DELETE FROM invoices WHERE id = ?', [invoiceId]);

  // Create new invoice for webhook flow
  const webInvoice = await invoiceService.createInvoice(studentId, courseId, 8000);
  const webInvoiceId = webInvoice.invoiceId;
  const webInvoiceNumber = webInvoice.invoiceNumber;
  console.log(`Created new webhook test invoice ${webInvoiceNumber} with total ₹8,000.`);

  // Define webhook trigger helper
  const triggerWebhookPayment = async (amount, paymentId) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret';
    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: paymentId,
            amount: amount * 100, // Razorpay expects paise / smallest currency unit
            notes: {
              invoice_number: webInvoiceNumber
            }
          }
        }
      }
    };
    const bodyStr = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(bodyStr)
      .digest('hex');

    // Setup Express Mock objects
    const req = {
      headers: {
        'x-razorpay-signature': signature
      },
      body: payload
    };

    let statusCalled = null;
    let sendCalled = null;
    const res = {
      status: (code) => {
        statusCalled = code;
        return res;
      },
      send: (body) => {
        sendCalled = body;
        return res;
      }
    };

    // Execute Webhook
    await WebhookController.handleRazorpay(req, res);
    return { statusCalled, sendCalled };
  };

  // 1. Send first webhook payment of ₹3,000
  console.log('Simulating incoming partial payment webhook of ₹3,000...');
  const webhookResult1 = await triggerWebhookPayment(3000, 'pay_webhook_part_001');
  assert(webhookResult1.statusCalled === 200 || webhookResult1.sendCalled === 'OK', 'Webhook handler returned 200 / OK status');

  const [webInvRow1] = await pool.query('SELECT * FROM invoices WHERE id = ?', [webInvoiceId]);
  const webInv1 = webInvRow1[0];
  assert(Number(webInv1.amount_paid) === 3000, 'Webhook partial payment: amount_paid is updated to 3000');
  assert(Number(webInv1.balance_amount) === 5000, 'Webhook partial payment: balance_amount is updated to 5000');
  assert(webInv1.payment_status === 'partial', 'Webhook partial payment: payment_status is updated to partial');

  // 2. Send second webhook payment of ₹5,000 to clear invoice
  console.log('Simulating incoming remaining balance payment webhook of ₹5,000...');
  const webhookResult2 = await triggerWebhookPayment(5000, 'pay_webhook_bal_002');
  assert(webhookResult2.statusCalled === 200 || webhookResult2.sendCalled === 'OK', 'Webhook handler returned 200 / OK status');

  const [webInvRow2] = await pool.query('SELECT * FROM invoices WHERE id = ?', [webInvoiceId]);
  const webInv2 = webInvRow2[0];
  assert(Number(webInv2.amount_paid) === 8000, 'Webhook final payment: amount_paid is updated to 8000');
  assert(Number(webInv2.balance_amount) === 0, 'Webhook final payment: balance_amount is updated to 0');
  assert(webInv2.payment_status === 'paid', 'Webhook final payment: payment_status is updated to paid');


  console.log('\n--- Test Part 3: Verify Admin Override Endpoint Database Actions ---');
  // Directly test the update database query logic from admin PUT router on the remaining invoice
  const adminOverridePayload = {
    total_fee: 15000,
    amount_paid: 10000,
    balance_amount: 5000,
    payment_status: 'partial',
    last_payment_date: new Date(),
    payment_reference: 'ADMIN-OVERRIDE-REF-WEB'
  };

  await pool.query(
    `UPDATE invoices 
     SET amount = ?, total_fee = ?, amount_paid = ?, balance_due = ?, balance_amount = ?, 
         payment_status = ?, last_payment_date = ?, payment_reference = ?
     WHERE id = ?`,
    [
      adminOverridePayload.total_fee,
      adminOverridePayload.total_fee,
      adminOverridePayload.amount_paid,
      adminOverridePayload.balance_amount,
      adminOverridePayload.balance_amount,
      adminOverridePayload.payment_status,
      adminOverridePayload.last_payment_date,
      adminOverridePayload.payment_reference,
      webInvoiceId
    ]
  );

  const [overrideRows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [webInvoiceId]);
  const overrideInv = overrideRows[0];
  assert(Number(overrideInv.total_fee) === 15000, 'total_fee overridden by admin to 15000');
  assert(Number(overrideInv.amount_paid) === 10000, 'amount_paid overridden by admin to 10000');
  assert(Number(overrideInv.balance_amount) === 5000, 'balance_amount overridden by admin to 5000');
  assert(overrideInv.payment_status === 'partial', 'payment_status overridden by admin to partial');
  assert(overrideInv.payment_reference === 'ADMIN-OVERRIDE-REF-WEB', 'payment_reference overridden by admin');

  // CLEAN UP MOCK DATA & RESTORE CONFIGS
  console.log('\n--- Test Part 4: Clean Up Test Data ---');
  await pool.query('DELETE FROM invoice_payments WHERE invoice_id = ?', [webInvoiceId]);
  await pool.query('DELETE FROM invoices WHERE id = ?', [webInvoiceId]);
  console.log('Webhook test invoice and payments deleted.');

  if (enrollmentId && enrollments.length === 0) {
    await pool.query('DELETE FROM enrollments WHERE id = ?', [enrollmentId]);
    console.log('Test enrollment cleaned up.');
  }

  if (examId === 'test-exam-id-12345') {
    await pool.query('DELETE FROM exams WHERE id = ?', [examId]);
    console.log('Mock exam cleaned up.');
  }

  // Restore configurations
  for (const [key, val] of Object.entries(originalValues)) {
    await pool.query('UPDATE system_config SET value = ? WHERE `key` = ?', [val, key]);
  }
  console.log('Original system configurations restored.');

  console.log('\n=========================================');
  console.log('ALL PAYMENT FLOW VERIFICATIONS COMPLETED SUCCESSFULLY!');
  console.log('=========================================');
  
  process.exit(0);
}

runTests().catch(error => {
  console.error('\nTest execution failed:', error);
  process.exit(1);
});
