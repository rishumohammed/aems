import { pool } from './src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';

async function seedExpense() {
  try {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO expenses (id, category, amount, type, description, payment_mode, date)
       VALUES (?, 'operations', 1200.00, 'debit', 'Office Supplies', 'cash', CURDATE())`,
      [id]
    );
    console.log('Seed expense created.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedExpense();
