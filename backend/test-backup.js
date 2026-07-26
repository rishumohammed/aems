import { runDatabaseBackup } from './src/jobs/database-backup.job.js';

const test = async () => {
  console.log("Starting manual test run...");
  await runDatabaseBackup();
  console.log("Done.");
}

test();
