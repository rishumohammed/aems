import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'aems_db'
  });

  try {
    const [columns] = await connection.query('DESCRIBE invoices');
    console.log('Invoices columns:', JSON.stringify(columns, null, 2));
    
    // Try running the failing query
    const [rows] = await connection.query(`
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
    console.log('Query successful, rows:', rows.length);
  } catch (err) {
    console.error('Query failed:', err.message);
  }

  await connection.end();
}

check().catch(console.error);
