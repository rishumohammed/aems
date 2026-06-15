const { pool } = require('../src/db/connection.js');

async function migrate() {
  const stmts = [
    `ALTER TABLE invoice_payments ADD COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved'`,
    `ALTER TABLE invoice_payments ADD COLUMN proof_path VARCHAR(255) NULL`,
    `ALTER TABLE invoice_payments ADD COLUMN remarks TEXT NULL`,
    `ALTER TABLE invoice_payments ADD COLUMN reviewed_by CHAR(36) NULL`,
    `ALTER TABLE invoice_payments ADD COLUMN reviewed_at TIMESTAMP NULL`,
    `ALTER TABLE invoice_payments MODIFY COLUMN mode ENUM('bank_transfer','cash','card','cheque','upi') NOT NULL`,
    `ALTER TABLE enrollments MODIFY COLUMN status ENUM('active','completed','suspended','suspended_offline') NOT NULL DEFAULT 'active'`
  ];
  
  for (const stmt of stmts) {
    try {
      await pool.query(stmt);
      console.log('OK:', stmt.substring(0, 70));
    } catch(e) {
      console.log('SKIP:', e.message.substring(0, 100));
    }
  }
  
  // Verify
  const [rows] = await pool.query('DESCRIBE invoice_payments');
  console.table(rows);
  process.exit(0);
}

migrate().catch(e => { console.error(e); process.exit(1); });
