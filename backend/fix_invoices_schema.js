import { pool } from './src/db/connection.js';

async function fix() {
  try {
    console.log('Checking invoices table...');
    const [cols] = await pool.query('DESCRIBE invoices');
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('invoice_number')) {
      console.log('Adding invoice_number to invoices...');
      await pool.query('ALTER TABLE invoices ADD COLUMN invoice_number VARCHAR(50) UNIQUE AFTER id');
    }

    if (!colNames.includes('due_date')) {
      console.log('Adding due_date to invoices...');
      await pool.query('ALTER TABLE invoices ADD COLUMN due_date DATE AFTER created_at');
    }

    if (!colNames.includes('pdf_path')) {
      console.log('Adding pdf_path to invoices...');
      await pool.query('ALTER TABLE invoices ADD COLUMN pdf_path VARCHAR(255) AFTER gateway_order_id');
    }

    console.log('Invoices table fixed.');

    // Also check payment_webhook_logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_webhook_logs (
        id CHAR(36) PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        payload JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('payment_webhook_logs table checked.');

    process.exit(0);
  } catch (error) {
    console.error('Fix failed:', error);
    process.exit(1);
  }
}

fix();
