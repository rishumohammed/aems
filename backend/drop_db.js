import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function clearDB() {
  const rootPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'aems_db';
  console.log(`Dropping database ${dbName}...`);
  await rootPool.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
  console.log(`Creating database ${dbName}...`);
  await rootPool.query(`CREATE DATABASE \`${dbName}\``);
  await rootPool.end();
  console.log('Database cleared and recreated.');
}

clearDB().catch(console.error);
