import { pool } from '../src/db/connection.js';

async function migrate() {
  try {
    console.log('Starting migration...');
    
    // Add deleted_at if missing (redundant check but safe)
    try {
      await pool.query('ALTER TABLE expenses ADD COLUMN deleted_at TIMESTAMP NULL');
    } catch (e) { /* ignore if already exists */ }
    
    try {
      await pool.query('ALTER TABLE invoices ADD COLUMN deleted_at TIMESTAMP NULL');
    } catch (e) { /* ignore if already exists */ }

    // Update Enums
    await pool.query("ALTER TABLE invoices MODIFY COLUMN payment_status ENUM('paid', 'partial', 'pending', 'voided') DEFAULT 'pending'");
    
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
