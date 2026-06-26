import { pool } from './src/db/connection.js';

async function run() {
  try {
    await pool.query(
      'INSERT INTO system_config (`key`, `value`, `group`, `description`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `description` = VALUES(`description`)',
      ['invoice_header_color', '#1a237e', 'branding', 'Invoice PDF header background color']
    );
    console.log('Seeded invoice_header_color OK');
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
run();
