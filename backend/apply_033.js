import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function applyMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aems',
    multipleStatements: true
  });

  const sqlPath = path.join(process.cwd(), 'src/db/migrations/033_course_qa_enhancements.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await connection.query(sql);
    console.log('Migration 033 applied successfully!');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
       console.log('Fields already exist, ignoring.');
    } else {
       console.error('Error applying migration:', err);
    }
  } finally {
    await connection.end();
  }
}

applyMigration();
