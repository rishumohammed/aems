import invoiceService from './src/services/invoice.service.js';
import { pool } from './src/db/connection.js';

async function test() {
  try {
    // 1. Find a student
    const [students] = await pool.query("SELECT id FROM users WHERE role = 'student' LIMIT 1");
    if (students.length === 0) {
      console.log('No student found to test with.');
      process.exit(0);
    }
    const studentId = students[0].id;

    // 2. Find a course
    const [courses] = await pool.query("SELECT id FROM courses LIMIT 1");
    const courseId = courses[0]?.id || null;

    // 3. Create Invoice
    console.log('Creating test invoice...');
    const result = await invoiceService.createInvoice(studentId, courseId, 5000);
    console.log('Invoice created:', result);

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

test();
