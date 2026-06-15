import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function reset() {
  const rootPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'aems_db';

  try {
    console.log(`Dropping database ${dbName}...`);
    await rootPool.query(`DROP DATABASE IF EXISTS ${dbName}`);
    
    console.log(`Creating database ${dbName}...`);
    await rootPool.query(`CREATE DATABASE ${dbName}`);
    
    console.log('Database reset successfully.');
  } catch (err) {
    console.error('Error resetting database:', err);
  } finally {
    await rootPool.end();
  }
}

reset();
