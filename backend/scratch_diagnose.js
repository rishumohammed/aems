import { pool } from './src/db/connection.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function run() {
  try {
    // Check jobs table columns
    const [jobsCols] = await pool.query('SHOW COLUMNS FROM jobs');
    console.log('\n── JOBS TABLE COLUMNS ──');
    jobsCols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));

    // Check system_config table
    const [cfgCols] = await pool.query('SHOW COLUMNS FROM system_config');
    console.log('\n── SYSTEM_CONFIG COLUMNS ──');
    cfgCols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));

    // Check system_config rows
    const [cfgRows] = await pool.query('SELECT * FROM system_config LIMIT 5');
    console.log('\n── SYSTEM_CONFIG ROWS (up to 5) ──');
    console.log(JSON.stringify(cfgRows, null, 2));

    // Check public.routes for hero/testimonials/team/faqs
    const [heroRows] = await pool.query("SHOW TABLES LIKE 'institute_info'");
    console.log('\n── institute_info table? ──', heroRows.length > 0 ? 'YES' : 'NO');

    const [teamRows] = await pool.query("SHOW TABLES LIKE 'team_members'");
    console.log('── team_members table? ──', teamRows.length > 0 ? 'YES' : 'NO');

    const [testimonialsRows] = await pool.query("SHOW TABLES LIKE 'testimonials'");
    console.log('── testimonials table? ──', testimonialsRows.length > 0 ? 'YES' : 'NO');

    // Check public routes for certs verify
    const [certsCols] = await pool.query('SHOW COLUMNS FROM certificates');
    console.log('\n── CERTIFICATES COLUMNS ──');
    certsCols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));

    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

run();
