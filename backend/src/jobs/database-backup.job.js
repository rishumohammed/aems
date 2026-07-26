import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const execAsync = util.promisify(exec);

export const runDatabaseBackup = async () => {
  console.log('Running daily database backup job...');
  
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPass = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'aems_db';
  
  const backupDir = path.join(process.cwd(), 'backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const fileName = `db-backup-${dateStr}.sql`;
  const filePath = path.join(backupDir, fileName);
  
  const passwordFlag = dbPass ? `-p"${dbPass}"` : '';
  const dumpCmd = `mysqldump -h ${dbHost} -u ${dbUser} ${passwordFlag} ${dbName} > "${filePath}"`;
  
  try {
    await execAsync(dumpCmd);
    console.log(`Database successfully backed up to ${fileName}`);
    
    // Cleanup files older than 7 days
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    
    files.forEach(file => {
      if (!file.endsWith('.sql')) return;
      
      const fullPath = path.join(backupDir, file);
      const stats = fs.statSync(fullPath);
      
      if (now - stats.mtimeMs > sevenDaysInMs) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted old backup file: ${file}`);
      }
    });
    
  } catch (err) {
    console.error('Failed to backup database:', err.message || err);
  }
};

export const initDatabaseBackupJob = () => {
  // Schedule to run every day at 2:00 AM
  cron.schedule('0 2 * * *', runDatabaseBackup);
};
