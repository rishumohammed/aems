import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verify() {
  const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
  if (!fs.existsSync(dummyPdfPath)) {
    fs.writeFileSync(dummyPdfPath, '%PDF-1.4\n%%EOF');
  }

  // Idempotence cleanup
  try {
    const [users] = await pool.query("SELECT id FROM users WHERE email = 'Sandra@mail.com'");
    if (users.length > 0) {
      const sandraId = users[0].id;
      await pool.query("DELETE FROM job_interviews WHERE application_id IN (SELECT id FROM job_applications WHERE student_id = ?)", [sandraId]);
      await pool.query("DELETE FROM job_applications WHERE student_id = ?", [sandraId]);
      console.log('Cleared existing applications and interviews for Sandra');
    }
  } catch (dbErr) {
    console.warn('DB clean-up failed (skipping):', dbErr.message);
  }

  try {
    // 1. Login as Jenkins (Employer)
    console.log('1. Logging in as Jenkins...');
    const jenkinsLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'Jenkins@mail.com',
      password: 'Password@123'
    });
    const employerToken = jenkinsLogin.data.accessToken;

    // 2. Fetch stats before new application
    console.log('2. Fetching Jenkins stats...');
    const statsRes1 = await axios.get('http://localhost:5000/api/employers/stats', {
      headers: { 'Authorization': `Bearer ${employerToken}` }
    });
    console.log('Initial stats:', statsRes1.data);
    const initialApps = statsRes1.data.totalApplications;

    // 3. Login as Sandra (Student)
    console.log('3. Logging in as Sandra...');
    const sandraLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'Sandra@mail.com',
      password: 'Password@123'
    });
    const studentToken = sandraLogin.data.accessToken;

    // 4. Sandra applies to Data Analyst job (cbed78c3-c386-48cf-8423-2da59a5a2911)
    console.log('4. Sandra applying to Data Analyst job...');
    const formData = new FormData();
    formData.append('first_name', 'Sandra');
    formData.append('last_name', 'Student');
    formData.append('dob', '2001-05-05');
    formData.append('email', 'Sandra@mail.com');
    formData.append('phone', '0987654321');
    formData.append('gender', 'Female');
    formData.append('city', 'Boston');
    formData.append('linkedin', 'https://linkedin.com/in/sandra');
    formData.append('qualification', 'Graduate');
    formData.append('degree', 'B.S. Information Systems');
    formData.append('institution', 'Boston Tech');
    formData.append('year_of_passing', '2023');
    formData.append('grade', '3.9');
    formData.append('field_of_study', 'IS');
    formData.append('employment_status', 'Fresher');
    formData.append('experience_years', '0');
    formData.append('last_company', '');
    formData.append('last_role', '');
    formData.append('duration', '');
    formData.append('key_skills', JSON.stringify(['Python', 'SQL', 'Tableau']));
    formData.append('cover_note', 'Hello, I love data!');
    
    const fileBlob = new Blob([fs.readFileSync(dummyPdfPath)], { type: 'application/pdf' });
    formData.append('resume', fileBlob, 'sandra_resume.pdf');

    const applyRes = await axios.post(
      'http://localhost:5000/api/jobs/cbed78c3-c386-48cf-8423-2da59a5a2911/apply',
      formData,
      { headers: { 'Authorization': `Bearer ${studentToken}` } }
    );
    const applicationId = applyRes.data.applicationId;
    console.log('Sandra application ID:', applicationId);

    // 5. Fetch stats after application
    console.log('5. Fetching Jenkins stats again...');
    const statsRes2 = await axios.get('http://localhost:5000/api/employers/stats', {
      headers: { 'Authorization': `Bearer ${employerToken}` }
    });
    console.log('Stats after application:', statsRes2.data);
    if (statsRes2.data.totalApplications !== initialApps + 1) {
      throw new Error('Application count did not increment!');
    }

    // 6. Schedule Interview for Sandra's application
    console.log('6. Scheduling interview for Sandra...');
    const scheduleRes = await axios.post(
      'http://localhost:5000/api/interviews',
      {
        application_id: applicationId,
        scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        location: '',
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        notes: 'Looking forward to meeting you!'
      },
      { headers: { 'Authorization': `Bearer ${employerToken}` } }
    );
    console.log('Interview scheduled response:', scheduleRes.data);

    // 6b. Attempt to schedule a duplicate interview
    console.log('6b. Attempting duplicate interview scheduling (should fail)...');
    try {
      await axios.post(
        'http://localhost:5000/api/interviews',
        {
          application_id: applicationId,
          scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
          location: '',
          meeting_link: 'https://meet.google.com/duplicate',
          notes: 'This should fail.'
        },
        { headers: { 'Authorization': `Bearer ${employerToken}` } }
      );
      throw new Error('Duplicate interview scheduling succeeded, but it should have failed!');
    } catch (dupError) {
      if (dupError.response && dupError.response.status === 400) {
        console.log('Duplicate scheduling failed with 400 Bad Request (as expected):', dupError.response.data.message);
      } else {
        throw dupError;
      }
    }

    // 7. Fetch stats after scheduling interview
    console.log('7. Fetching stats after scheduling...');
    const statsRes3 = await axios.get('http://localhost:5000/api/employers/stats', {
      headers: { 'Authorization': `Bearer ${employerToken}` }
    });
    console.log('Stats after interview schedule:', statsRes3.data);
    if (statsRes3.data.interviewsScheduled === 0) {
      throw new Error('Interviews scheduled count is 0!');
    }

    // 8. Hire Sandra (map to shortlisted)
    console.log('8. Hiring candidate Sandra (should patch to shortlisted)...');
    const decisionRes = await axios.patch(
      `http://localhost:5000/api/employers/applications/${applicationId}/status`,
      { status: 'shortlisted' },
      { headers: { 'Authorization': `Bearer ${employerToken}` } }
    );
    console.log('Hire response:', decisionRes.data);

    // 9. Fetch stats after hire (shortlist)
    console.log('9. Fetching stats after hire...');
    const statsRes4 = await axios.get('http://localhost:5000/api/employers/stats', {
      headers: { 'Authorization': `Bearer ${employerToken}` }
    });
    console.log('Stats after hire decision:', statsRes4.data);
    if (statsRes4.data.hiresMade === 0) {
      throw new Error('Hires made count is 0!');
    }

    console.log('\nSUCCESS: All fixes and integrations successfully verified!');
  } catch (err) {
    console.error('\nVERIFICATION FAILED:', err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
      console.error('Response Data:', err.response.data);
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

verify();
