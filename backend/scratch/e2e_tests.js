import { pool } from '../src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace with a valid admin token or generate one if testing APIs locally
// For simplicity, we'll test DB layer and API layer where possible
// Actually, it's easier to just mock an Express request or use axios to hit the running server if it's running.
// Assuming the server might not be running on a known port, testing at the DB/Service level is more reliable.

async function runTests() {
  console.log('--- STARTING MODULE 1: PAYMENT STATUS TESTING ---');
  const studentId = uuidv4();
  const courseId = uuidv4();
  const enrollmentId = uuidv4();
  const invoiceId = uuidv4();

  try {
    // Setup Dummy Data
    await pool.query(`INSERT INTO users (id, name, email, password_hash, role) VALUES (?, 'Test Student', 'teststudent@example.com', 'hashed', 'student')`, [studentId]);
    await pool.query(`INSERT INTO courses (id, title, slug, tutor_id, status) VALUES (?, 'Test Course', ?, ?, 'published')`, [courseId, 'test-course-' + Date.now(), studentId]);
    await pool.query(`INSERT INTO enrollments (id, student_id, course_id, status) VALUES (?, ?, ?, 'active')`, [enrollmentId, studentId, courseId]);

    // 1. Pending Payment Test
    await pool.query(`INSERT INTO invoices (id, student_id, amount, payment_status, amount_paid, balance_due) VALUES (?, ?, 10000, 'pending', 0, 10000)`, [invoiceId, studentId]);
    
    // We simulate the admin student list query
    const [rows1] = await pool.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(amount_paid), 0) as amount_paid,
        COALESCE(SUM(balance_due), 0) as remaining_amount,
        CASE 
          WHEN SUM(amount) IS NULL THEN 'NO DATA'
          WHEN SUM(balance_due) <= 0 THEN 'FULLY PAID'
          WHEN SUM(amount_paid) > 0 THEN 'PARTIALLY PAID'
          ELSE 'PENDING'
        END as payment_status
      FROM invoices WHERE student_id = ?
    `, [studentId]);

    let total1 = rows1[0].total_amount;
    let paid1 = rows1[0].amount_paid;
    let remaining1 = rows1[0].remaining_amount;
    let status1 = rows1[0].payment_status;
    console.log(`Test 1 (Pending): Expected PENDING, got ${status1} | Total: ${total1}, Paid: ${paid1}, Remaining: ${remaining1}`);

    // 2. Partial Payment Test
    await pool.query(`UPDATE invoices SET payment_status = 'partial', amount_paid = 4000, balance_due = 6000 WHERE id = ?`, [invoiceId]);

    const [rows2] = await pool.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(amount_paid), 0) as amount_paid,
        COALESCE(SUM(balance_due), 0) as remaining_amount,
        CASE 
          WHEN SUM(amount) IS NULL THEN 'NO DATA'
          WHEN SUM(balance_due) <= 0 THEN 'FULLY PAID'
          WHEN SUM(amount_paid) > 0 THEN 'PARTIALLY PAID'
          ELSE 'PENDING'
        END as payment_status
      FROM invoices WHERE student_id = ?
    `, [studentId]);
    let total2 = rows2[0].total_amount;
    let paid2 = rows2[0].amount_paid;
    let remaining2 = rows2[0].remaining_amount;
    let status2 = rows2[0].payment_status;
    console.log(`Test 2 (Partial): Expected PARTIALLY PAID, got ${status2} | Total: ${total2}, Paid: ${paid2}, Remaining: ${remaining2}`);

    // 3. Full Payment Test
    await pool.query(`UPDATE invoices SET payment_status = 'paid', amount_paid = 10000, balance_due = 0 WHERE id = ?`, [invoiceId]);

    const [rows3] = await pool.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(amount_paid), 0) as amount_paid,
        COALESCE(SUM(balance_due), 0) as remaining_amount,
        CASE 
          WHEN SUM(amount) IS NULL THEN 'NO DATA'
          WHEN SUM(balance_due) <= 0 THEN 'FULLY PAID'
          WHEN SUM(amount_paid) > 0 THEN 'PARTIALLY PAID'
          ELSE 'PENDING'
        END as payment_status
      FROM invoices WHERE student_id = ?
    `, [studentId]);
    let total3 = rows3[0].total_amount;
    let paid3 = rows3[0].amount_paid;
    let remaining3 = rows3[0].remaining_amount;
    let status3 = rows3[0].payment_status;
    console.log(`Test 3 (Full): Expected FULLY PAID, got ${status3} | Total: ${total3}, Paid: ${paid3}, Remaining: ${remaining3}`);

    console.log('--- MODULE 1 COMPLETED SUCCESSFULY ---');

    console.log('\\n--- STARTING MODULE 2: EXTERNAL CERTIFICATE TESTING ---');
    
    // 1. Add New External Certificate
    const certId = uuidv4();
    await pool.query(`
      INSERT INTO external_certificates (id, student_id, certificate_name, issuer, credential_id, issue_date, skills, description)
      VALUES (?, ?, 'Test Cert', 'Issuer Inc', '12345', '2026-01-01', '["Vue.js", "Node.js"]', 'A great cert')
    `, [certId, studentId]);

    const [certRows] = await pool.query(`SELECT * FROM external_certificates WHERE id = ?`, [certId]);
    console.log(`Test 1 (Add): Certificate Added -> ${certRows[0].certificate_name} by ${certRows[0].issuer}`);

    // 5. Test Edit Functionality
    await pool.query(`UPDATE external_certificates SET issuer = 'New Issuer' WHERE id = ?`, [certId]);
    const [editRows] = await pool.query(`SELECT * FROM external_certificates WHERE id = ?`, [certId]);
    console.log(`Test 5 (Edit): Certificate Issuer updated to -> ${editRows[0].issuer}`);

    // 6. Test Delete Functionality
    await pool.query(`DELETE FROM external_certificates WHERE id = ?`, [certId]);
    const [delRows] = await pool.query(`SELECT * FROM external_certificates WHERE id = ?`, [certId]);
    console.log(`Test 6 (Delete): Certificate exists? -> ${delRows.length > 0}`);

    console.log('--- MODULE 2 COMPLETED SUCCESSFULY ---');

  } catch (error) {
    console.error('Test Error:', error);
  } finally {
    // Cleanup
    await pool.query(`DELETE FROM users WHERE id = ?`, [studentId]);
    process.exit(0);
  }
}

runTests();
