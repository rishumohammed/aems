import { pool } from './src/db/connection.js';

async function migrate() {
  try {
    console.log('Starting migration...');

    // Update Invoices table
    await pool.query(`
      ALTER TABLE invoices 
      ADD COLUMN invoice_number VARCHAR(50) UNIQUE AFTER id,
      ADD COLUMN due_date DATE AFTER created_at,
      ADD COLUMN pdf_path VARCHAR(255) AFTER gateway_order_id,
      MODIFY COLUMN payment_status ENUM('paid', 'partial', 'pending', 'voided') DEFAULT 'pending'
    `);
    console.log('Invoices table updated.');

    // Update Expenses table
    await pool.query(`
      ALTER TABLE expenses 
      ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
    `);
    console.log('Expenses table updated.');

    // Create Payment Webhook Logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_webhook_logs (
        id CHAR(36) PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        payload JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('payment_webhook_logs table created.');

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
