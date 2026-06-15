import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function simulate() {
  const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
  
  // 1. Create a minimal valid-ish PDF header file if not exists
  if (!fs.existsSync(dummyPdfPath)) {
    fs.writeFileSync(dummyPdfPath, '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n111\n%%EOF');
    console.log('Created dummy PDF file');
  }

  try {
    // 2. Login
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sophie@mail.com',
      password: 'Password@123'
    });
    
    const token = loginRes.data.accessToken;
    console.log('Login successful. Token:', token.substring(0, 15) + '...');

    // 3. Prepare FormData
    const formData = new FormData();
    formData.append('first_name', 'Sophie');
    formData.append('last_name', 'Student');
    formData.append('dob', '2000-01-01');
    formData.append('email', 'sophie@mail.com');
    formData.append('phone', '1234567890');
    formData.append('gender', 'Female');
    formData.append('city', 'New York');
    formData.append('linkedin', 'https://linkedin.com/in/sophie');
    formData.append('qualification', 'Graduate');
    formData.append('degree', 'B.S. Computer Science');
    formData.append('institution', 'State University');
    formData.append('year_of_passing', '2022');
    formData.append('grade', '3.8');
    formData.append('field_of_study', 'Computer Science');
    formData.append('employment_status', 'Fresher');
    formData.append('experience_years', '0');
    formData.append('last_company', '');
    formData.append('last_role', '');
    formData.append('duration', '');
    formData.append('key_skills', JSON.stringify(['JavaScript', 'Vue', 'Node']));
    formData.append('cover_note', 'This is a test application cover note.');

    // Read the PDF file
    const fileBuffer = fs.readFileSync(dummyPdfPath);
    const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('resume', fileBlob, 'dummy.pdf');

    // 4. Submit Job Application
    console.log('Submitting application...');
    const applyRes = await axios.post(
      'http://localhost:5000/api/jobs/cbed78c3-c386-48cf-8423-2da59a5a2911/apply',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Apply Response Status:', applyRes.status);
    console.log('Apply Response Data:', applyRes.data);

  } catch (err) {
    console.error('Simulation Failed:', err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
      console.error('Response Data:', err.response.data);
    }
  } finally {
    process.exit(0);
  }
}

simulate();
