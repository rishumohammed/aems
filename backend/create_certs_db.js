import { pool } from './src/db/connection.js';

async function run() {
  try {
    // 1. Alter certificates
    try {
      await pool.query('ALTER TABLE certificates ADD COLUMN pdf_path VARCHAR(255)');
      await pool.query('ALTER TABLE certificates ADD COLUMN revoked_at DATETIME');
      console.log('Altered certificates table');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Columns already exist in certificates');
      } else {
        throw e;
      }
    }

    // 2. Create cert_template_config
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cert_template_config (
        id INT PRIMARY KEY DEFAULT 1,
        institution_name VARCHAR(255) DEFAULT 'AEMS Academy',
        logo_url VARCHAR(255),
        brand_color VARCHAR(50) DEFAULT '#3b82f6',
        signatory_name VARCHAR(100) DEFAULT 'Director',
        signatory_title VARCHAR(100) DEFAULT 'Head of Education',
        signature_url VARCHAR(255),
        background_url VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default config if empty
    const [rows] = await pool.query('SELECT id FROM cert_template_config WHERE id = 1');
    if (rows.length === 0) {
      await pool.query('INSERT INTO cert_template_config (id) VALUES (1)');
    }
    console.log('Created cert_template_config table');

    // 3. Create cert_verification_logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cert_verification_logs (
        id CHAR(36) PRIMARY KEY,
        cert_id CHAR(36) NOT NULL,
        ip_address VARCHAR(50),
        verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cert_id) REFERENCES certificates(id) ON DELETE CASCADE
      )
    `);
    console.log('Created cert_verification_logs table');

  } catch (e) {
    console.error('DB Error:', e.message);
  }
  process.exit(0);
}
run();
