import { pool } from './src/db/connection.js';

async function run() {
  console.log('Running database evolution: add installment_number to invoice_payments...');

  try {
    // 1. Check if column exists
    const [cols] = await pool.query("SHOW COLUMNS FROM invoice_payments LIKE 'installment_number'");
    if (cols.length === 0) {
      console.log('Adding installment_number column to invoice_payments...');
      await pool.query("ALTER TABLE invoice_payments ADD COLUMN installment_number INT NOT NULL DEFAULT 1");
      console.log('installment_number column added successfully.');
    } else {
      console.log('installment_number column already exists.');
    }

    // 2. Sequential numbering of existing payments (ordered chronologically by paid_at)
    const [payments] = await pool.query("SELECT id, invoice_id, paid_at FROM invoice_payments ORDER BY invoice_id, paid_at ASC");
    console.log(`Retrieved ${payments.length} existing payments to index.`);

    const countMap = {};
    for (const p of payments) {
      if (!countMap[p.invoice_id]) {
        countMap[p.invoice_id] = 0;
      }
      countMap[p.invoice_id] += 1;
      const instNum = countMap[p.invoice_id];

      await pool.query(
        "UPDATE invoice_payments SET installment_number = ? WHERE id = ?",
        [instNum, p.id]
      );
    }
    console.log('Sequential installment indexing completed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
