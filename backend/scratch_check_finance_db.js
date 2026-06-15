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

  const [invoices] = await connection.query('SELECT COUNT(*) as count FROM invoices');
  const [expenses] = await connection.query('SELECT COUNT(*) as count FROM expenses');
  const [recent_invoices] = await connection.query('SELECT * FROM invoices ORDER BY created_at DESC LIMIT 5');
  const [recent_expenses] = await connection.query('SELECT * FROM expenses ORDER BY date DESC LIMIT 5');

  console.log('Invoices count:', invoices[0].count);
  console.log('Expenses count:', expenses[0].count);
  console.log('Recent Invoices:', JSON.stringify(recent_invoices, null, 2));
  console.log('Recent Expenses:', JSON.stringify(recent_expenses, null, 2));

  await connection.end();
}

check().catch(console.error);
