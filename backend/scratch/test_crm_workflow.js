import { pool } from '../src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import enrollmentService from '../src/services/enrollment.service.js';

async function runTest() {
  let leadId, studentId, courseId;
  try {
    console.log('--- STARTING CRM TO LMS WORKFLOW VERIFICATION ---');

    // Setup: Get a valid course ID
    const [courses] = await pool.query('SELECT id, title, price FROM courses LIMIT 1');
    if (courses.length === 0) throw new Error('No courses found to enroll in.');
    courseId = courses[0].id;
    console.log(`Using Course: ${courses[0].title} (ID: ${courseId})`);

    // 1. LEAD GENERATION
    leadId = uuidv4();
    const testEmail = `test.lead.${Date.now()}@example.com`;
    console.log(`\n[1] Creating Test Lead: ${testEmail}`);
    
    await pool.query(
      `INSERT INTO leads (id, name, email, phone, course_interest_id, source, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [leadId, 'Workflow Test Lead', testEmail, '555-0000', courseId, 'Website', 'new']
    );
    console.log('✔ Lead created successfully.');

    // 2. LEAD CONVERSION
    console.log('\n[2] Converting Lead to Student...');
    
    // We simulate what the CRMController does
    await pool.query('UPDATE leads SET status = "converted" WHERE id = ?', [leadId]);
    
    const result = await enrollmentService.enrollStudent({
      leadId: leadId,
      studentData: {
        name: 'Workflow Test Lead',
        email: testEmail,
        phone: '555-0000'
      },
      courseId: courseId,
      pricing: { amount: courses[0].price },
      payment: {
        mode: 'online',
        amountPaid: 0
      }
    });

    studentId = result.studentId;
    console.log(`✔ Lead converted! Assigned Student ID: ${studentId}`);
    console.log(`✔ Enrollment ID generated: ${result.enrollmentId}`);
    if (result.tempPassword) {
      console.log(`✔ Temporary password generated.`);
    }

    // 3. VERIFY ENROLLMENT
    console.log('\n[3] Verifying LMS Enrollment Linkage...');
    const [enrollments] = await pool.query('SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?', [studentId, courseId]);
    if (enrollments.length === 0) throw new Error('Enrollment record not found in DB!');
    console.log('✔ Enrollment record confirmed in database.');
    
    const [profiles] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [studentId]);
    if (profiles.length === 0) throw new Error('Student profile not created!');
    console.log('✔ Student profile confirmed in database.');

    // 4. TEST DUPLICATE
    console.log('\n[4] Testing Duplicate Enrollment Prevention...');
    try {
      await enrollmentService.enrollStudent({
        leadId: leadId,
        studentData: { name: 'Test', email: testEmail, phone: '555-0000' },
        courseId: courseId,
        pricing: { amount: courses[0].price },
        payment: { mode: 'online', amountPaid: 0 }
      });
      console.error('❌ Failed: Allowed duplicate enrollment!');
    } catch (err) {
      if (err.message === 'ALREADY_ENROLLED') {
        console.log('✔ Duplicate enrollment correctly prevented.');
      } else {
        throw err;
      }
    }

    console.log('\n--- VERIFICATION SUCCESSFUL ---');
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error);
  } finally {
    // 5. CLEANUP
    console.log('\nCleaning up test data...');
    if (leadId) await pool.query('DELETE FROM leads WHERE id = ?', [leadId]);
    if (studentId) {
      await pool.query('DELETE FROM enrollments WHERE student_id = ?', [studentId]);
      await pool.query('DELETE FROM student_profiles WHERE user_id = ?', [studentId]);
      await pool.query('DELETE FROM users WHERE id = ?', [studentId]);
    }
    console.log('✔ Cleanup complete.');
    process.exit(0);
  }
}

runTest();
