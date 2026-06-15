import certificateService from './src/services/certificate.service.js';

async function run() {
  try {
    const studentId = '00a59ffc-9e59-4f4a-9007-db8a12d5487e';
    const courseId = '871a8fe8-508c-4ca8-bfa1-79e324e68de8';
    
    console.log('Issuing manual certificate...');
    const result = await certificateService.issueManual(studentId, courseId);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
