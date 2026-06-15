import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './src/db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    const sqlPath = path.join(__dirname, 'src', 'db', 'migrations', '015_job_approval_workflow.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    const queries = sqlContent.split(';').map(q => q.trim()).filter(q => q.length > 0);
    
    for (const query of queries) {
      console.log('Running:', query.substring(0, 50) + '...');
      await pool.query(query);
    }
    console.log('Successfully applied 015_job_approval_workflow.sql');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

run();
