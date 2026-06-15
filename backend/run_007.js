import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './src/db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSingle() {
    const file = '007_system_config_and_forms_update.sql';
    const filePath = path.join(__dirname, 'src', 'db', 'migrations', file);
    const sql = fs.readFileSync(filePath, 'utf8');

    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await connection.query(statement);
      }
      await connection.commit();
      console.log(`Successfully completed migration: ${file}`);
    } catch (error) {
      await connection.rollback();
      console.error(`Error in migration ${file}:`, error);
    } finally {
      connection.release();
      process.exit(0);
    }
}

runSingle();
