import { pool } from './src/db/connection.js';

async function run() {
  try {
    console.log('Checking invoices table schema...');
    const [cols] = await pool.query('DESCRIBE invoices');
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('total_fee')) {
      console.log('Adding total_fee column to invoices...');
      await pool.query('ALTER TABLE invoices ADD COLUMN total_fee DECIMAL(10, 2) DEFAULT 0.00 AFTER amount');
      await pool.query('UPDATE invoices SET total_fee = amount');
      console.log('total_fee column added and populated.');
    }

    if (!colNames.includes('balance_amount')) {
      console.log('Adding balance_amount column to invoices...');
      await pool.query('ALTER TABLE invoices ADD COLUMN balance_amount DECIMAL(10, 2) DEFAULT 0.00 AFTER balance_due');
      await pool.query('UPDATE invoices SET balance_amount = balance_due');
      console.log('balance_amount column added and populated.');
    }

    if (!colNames.includes('last_payment_date')) {
      console.log('Adding last_payment_date column to invoices...');
      await pool.query('ALTER TABLE invoices ADD COLUMN last_payment_date TIMESTAMP NULL DEFAULT NULL AFTER due_date');
      console.log('last_payment_date column added.');
    }

    if (!colNames.includes('payment_reference')) {
      console.log('Adding payment_reference column to invoices...');
      await pool.query('ALTER TABLE invoices ADD COLUMN payment_reference VARCHAR(255) DEFAULT NULL AFTER pdf_path');
      console.log('payment_reference column added.');
    }

    console.log('Populating last_payment_date and payment_reference from payments history...');
    await pool.query(`
      UPDATE invoices i
      JOIN (
        SELECT invoice_id, MAX(paid_at) as max_paid_at
        FROM invoice_payments
        GROUP BY invoice_id
      ) ip_date ON i.id = ip_date.invoice_id
      LEFT JOIN invoice_payments ip_ref ON i.id = ip_ref.invoice_id AND ip_ref.paid_at = ip_date.max_paid_at
      SET i.last_payment_date = ip_date.max_paid_at,
          i.payment_reference = ip_ref.reference
      WHERE i.last_payment_date IS NULL
    `);
    console.log('Invoices columns synchronized.');

    console.log('Ensuring system config for payment options exists...');
    await pool.query(`
      INSERT IGNORE INTO system_config (\`key\`, \`value\`, \`group\`, \`description\`) VALUES
      ('payment_allow_partial_access', 'true', 'payments', 'Allow course access after partial payment (Option A)'),
      ('payment_restrict_certificate', 'true', 'payments', 'Restrict certificate generation until fully paid (Option B)'),
      ('payment_restrict_exam', 'false', 'payments', 'Restrict final exam until fully paid (Option C)')
    `);
    console.log('System config items ensured.');

    console.log('Database evolution applied successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Database migration failed:', error);
    process.exit(1);
  }
}

run();
