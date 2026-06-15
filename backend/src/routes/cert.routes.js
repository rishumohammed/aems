import express from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { pool } from '../db/connection.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import certificateService from '../services/certificate.service.js';

const router = express.Router();

// Multer Storage Configuration for External Certificates
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/external_certificates';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'ext-cert-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ────────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ────────────────────────────────────────────────────────────────────────────────
// Placed before the wildcard :id routes or in a distinct namespace
router.get('/public/verify-certificate/:certId', async (req, res) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const result = await certificateService.verifyCertificate(req.params.certId, ipAddress);
    if (!result.verified && result.message === 'Certificate not found') {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// STUDENT / AUTHENTICATED ROUTES
// ────────────────────────────────────────────────────────────────────────────────

// Get my certificates
router.get('/my-certificates', authenticateJWT, async (req, res) => {
  try {
    const certs = await certificateService.getMyCertificates(req.user.id);
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get external certificates
router.get('/external', authenticateJWT, async (req, res) => {
  try {
    const [certs] = await pool.query('SELECT * FROM external_certificates WHERE student_id = ? ORDER BY issue_date DESC', [req.user.id]);
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload external certificate
router.post('/external', authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    const { certificate_name, issuer, credential_id, issue_date, expiry_date, skills, description, verification_url, student_id } = req.body;
    const file_url = req.file ? `/uploads/external_certificates/${req.file.filename}` : null;
    const id = uuidv4();
    
    // Determine target student ID
    let targetStudentId = req.user.id;
    if ((req.user.role === 'super_admin' || req.user.role === 'tutor') && student_id) {
      targetStudentId = student_id;
    }
    
    const sanitize = (val) => (val === 'null' || val === 'undefined' || val === '') ? null : val;
    
    let parsedSkills = [];
    try {
      if (skills && skills !== 'undefined' && skills !== 'null') {
        parsedSkills = JSON.parse(skills);
      }
    } catch(e) { 
      parsedSkills = skills ? [skills] : [];
    }

    await pool.query(
      `INSERT INTO external_certificates (id, student_id, certificate_name, issuer, credential_id, issue_date, expiry_date, file_url, skills, description, verification_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        targetStudentId, 
        certificate_name, 
        issuer, 
        sanitize(credential_id), 
        issue_date, 
        sanitize(expiry_date), 
        file_url, 
        JSON.stringify(parsedSkills), 
        sanitize(description), 
        sanitize(verification_url)
      ]
    );

    res.status(201).json({ id, message: 'External certificate added successfully', file_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update external certificate
router.put('/external/:id', authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    const { certificate_name, issuer, credential_id, issue_date, expiry_date, skills, description, verification_url, student_id } = req.body;
    
    // Determine target student ID
    let targetStudentId = req.user.id;
    if ((req.user.role === 'super_admin' || req.user.role === 'tutor') && student_id) {
      targetStudentId = student_id;
    }

    const sanitize = (val) => (val === 'null' || val === 'undefined' || val === '') ? null : val;

    let parsedSkills = [];
    try {
      if (skills && skills !== 'undefined' && skills !== 'null') {
        parsedSkills = JSON.parse(skills);
      }
    } catch(e) { 
      parsedSkills = skills ? [skills] : [];
    }

    const fields = ['certificate_name', 'issuer', 'credential_id', 'issue_date', 'expiry_date', 'description', 'verification_url', 'skills'];
    const values = [
      certificate_name, 
      issuer, 
      sanitize(credential_id), 
      issue_date, 
      sanitize(expiry_date), 
      sanitize(description), 
      sanitize(verification_url), 
      JSON.stringify(parsedSkills)
    ];
    
    if (req.file) {
      fields.push('file_url');
      values.push(`/uploads/external_certificates/${req.file.filename}`);
    }

    values.push(req.params.id, targetStudentId);
    
    const updateQuery = `UPDATE external_certificates SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ? AND student_id = ?`;
    await pool.query(updateQuery, values);
    
    res.json({ message: 'External certificate updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete external certificate
router.delete('/external/:id', authenticateJWT, async (req, res) => {
  try {
    const { student_id } = req.query;
    
    // Determine target student ID
    let targetStudentId = req.user.id;
    if ((req.user.role === 'super_admin' || req.user.role === 'tutor') && student_id) {
      targetStudentId = student_id;
    }

    const [cert] = await pool.query('SELECT file_url FROM external_certificates WHERE id = ? AND student_id = ?', [req.params.id, targetStudentId]);
    if (cert.length > 0 && cert[0].file_url) {
      const filePath = path.join(process.cwd(), cert[0].file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await pool.query('DELETE FROM external_certificates WHERE id = ? AND student_id = ?', [req.params.id, targetStudentId]);
    res.json({ message: 'External certificate deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Claim/apply for certificate after 100% completion of course
router.post('/claim', authenticateJWT, async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ message: 'courseId is required' });
    }

    // 1. Verify student's enrollment and progress
    const [enrollments] = await pool.query(
      'SELECT id, completion_percentage FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (enrollments.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found for this course' });
    }

    const enrollment = enrollments[0];
    if (enrollment.completion_percentage < 100) {
      return res.status(400).json({ message: 'Course is not fully completed yet' });
    }

    // 1.5. Verify student passed the exam for this course (if an exam exists)
    const [exams] = await pool.query('SELECT id FROM exams WHERE course_id = ?', [courseId]);
    if (exams.length > 0) {
      const examId = exams[0].id;
      const [attempts] = await pool.query('SELECT id FROM exam_attempts WHERE exam_id = ? AND student_id = ? AND passed = 1', [examId, studentId]);
      if (attempts.length === 0) {
        return res.status(400).json({ message: 'You must pass the course exam before claiming your certificate.' });
      }
    }

    // Check Option B (Restrict certificate generation until fully paid)
    const [configs] = await pool.query('SELECT value FROM system_config WHERE `key` = "payment_restrict_certificate"');
    const restrictCert = configs[0]?.value === 'true';
    if (restrictCert) {
      const [invoices] = await pool.query(
        'SELECT payment_status FROM invoices WHERE student_id = ? AND course_id = ?',
        [studentId, courseId]
      );
      if (invoices.length > 0 && invoices[0].payment_status !== 'paid') {
        return res.status(400).json({ message: 'Certificate generation is restricted until the course is fully paid.' });
      }
    }

    // 2. Check if a certificate has already been issued
    const [existingCerts] = await pool.query(
      'SELECT id, cert_number, pdf_path FROM certificates WHERE student_id = ? AND course_id = ? AND status = "active"',
      [studentId, courseId]
    );

    if (existingCerts.length > 0) {
      return res.json({
        message: 'Certificate already issued',
        certId: existingCerts[0].id,
        certNumber: existingCerts[0].cert_number,
        pdfUrl: existingCerts[0].pdf_path
      });
    }

    // 3. Issue certificate using the manual issuance service flow
    const result = await certificateService.issueManual(studentId, courseId);
    
    // 4. Create in-app system notification
    const notificationId = uuidv4();
    await pool.query(
      'INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
      [notificationId, studentId, 'Certificate Issued! 🎓', `Congratulations! Your certificate for completing the course is now ready.`, 'system']
    );

    res.status(201).json({
      message: 'Certificate issued successfully',
      ...result
    });
  } catch (error) {
    console.error('Error claiming certificate:', error);
    res.status(500).json({ message: error.message });
  }
});

// Download PDF securely
router.get('/:id/download', authenticateJWT, async (req, res) => {
  try {
    const certId = req.params.id;
    // Look up in DB to get the actual file path and cert number
    const [rows] = await pool.query(
      'SELECT cert_number, pdf_path FROM certificates WHERE id = ?',
      [certId]
    );

    if (rows.length === 0) {
      // Fallback: check if it's a cert_number instead of a UUID
      const [rowsByNum] = await pool.query(
        'SELECT cert_number, pdf_path FROM certificates WHERE cert_number = ?',
        [certId]
      );
      if (rowsByNum.length === 0) {
        return res.status(404).json({ message: 'Certificate not found' });
      }
      rows.push(rowsByNum[0]);
    }

    const cert = rows[0];
    const pdfPath = path.join(process.cwd(), cert.pdf_path);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: 'Certificate PDF file not found on server' });
    }

    res.download(pdfPath, `${cert.cert_number}.pdf`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ────────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ────────────────────────────────────────────────────────────────────────────────
const isAdmin = authorizeRoles('super_admin', 'tutor');

// Get all certificates
router.get('/admin', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const certs = await certificateService.getAllCertificates(req.user.id, req.user.role);
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Revoke
router.put('/admin/:certNumber/revoke', authenticateJWT, isAdmin, async (req, res) => {
  try {
    await certificateService.revoke(req.params.certNumber);
    res.json({ message: 'Certificate revoked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Re-issue
router.post('/admin/:certNumber/reissue', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const result = await certificateService.reissue(req.params.certNumber);
    res.json({ message: 'Certificate re-issued', ...result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Template Config
router.get('/admin/template-config', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const config = await certificateService.getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Template Config
router.put('/admin/template-config', authenticateJWT, isAdmin, async (req, res) => {
  try {
    await certificateService.updateConfig(req.body);
    res.json({ message: 'Template config updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manual Issue
router.post('/admin/issue-manual', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      return res.status(400).json({ message: 'studentId and courseId are required' });
    }
    const result = await certificateService.issueManual(studentId, courseId);
    res.status(201).json({ message: 'Certificate issued manually', ...result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
