import { pool } from './src/db/connection.js';

async function run() {
  const [rows] = await pool.query('SELECT * FROM system_config');
  rows.forEach(r => {
    if(r.key.includes('name') || r.key.includes('logo') || r.key.includes('address') || r.key.includes('email') || r.key.includes('phone') || r.key.includes('app_')) {
      console.log(r.key, r.value);
    }
  });
  process.exit(0);
}
run();
