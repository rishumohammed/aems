import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/connection.js';
import { generateCertNumber } from '../utils/certNumber.js';
// import { sendEmail } from './email.service.js'; // Assuming you have an email service
// import { createNotification } from './notification.service.js'; // Assuming you have notifications

class CertificateService {
  async generate(attemptId) {
    // 1. Fetch Attempt, Exam, Course, and Student details
    const [attempts] = await pool.query(
      `SELECT ea.*, e.title as exam_title, c.id as course_id, c.title as course_title, u.id as student_id, u.name, u.email
       FROM exam_attempts ea
       JOIN exams e ON ea.exam_id = e.id
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON ea.student_id = u.id
       WHERE ea.id = ? AND ea.passed = TRUE`,
      [attemptId]
    );

    if (attempts.length === 0) {
      throw new Error('Valid passed exam attempt not found');
    }

    const attempt = attempts[0];
    const studentName = attempt.name;

    // 2. Idempotency Check
    const [existing] = await pool.query(
      'SELECT id, cert_number FROM certificates WHERE exam_attempt_id = ?',
      [attemptId]
    );
    if (existing.length > 0) {
      return { message: 'Certificate already exists', certNumber: existing[0].cert_number };
    }

    // 3. Generate unique cert number
    let certNumber = generateCertNumber();
    let isUnique = false;
    while (!isUnique) {
      const [check] = await pool.query('SELECT id FROM certificates WHERE cert_number = ?', [certNumber]);
      if (check.length === 0) isUnique = true;
      else certNumber = generateCertNumber();
    }

    // 4. Fetch Config
    const [configs] = await pool.query('SELECT * FROM cert_template_config WHERE id = 1');
    const config = configs[0] || {
      institution_name: 'Brixify',
      brand_color: '#3b82f6',
      signatory_name: 'Director',
      signatory_title: 'Head of Education'
    };

    // 5. Generate PDF
    const pdfDir = path.join(process.cwd(), 'uploads', 'certificates');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    const pdfPathLocal = path.join(pdfDir, `${certNumber}.pdf`);
    const pdfUrl = `/uploads/certificates/${certNumber}.pdf`;

    await this.createPDF(pdfPathLocal, certNumber, studentName, attempt.course_title, config);

    // 6. DB Record
    const certId = uuidv4();
    await pool.query(
      `INSERT INTO certificates (id, student_id, course_id, exam_attempt_id, cert_number, pdf_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [certId, attempt.student_id, attempt.course_id, attemptId, certNumber, pdfUrl]
    );

    // 7. Notifications (Mocked or un-implemented in this specific prompt, but conceptually here)
    // await createNotification({ userId: attempt.student_id, title: 'Certificate Issued!', message: 'You have earned a new certificate.' });
    
    return { certId, certNumber, pdfUrl };
  }

  async createPDF(filePath, certNumber, studentName, courseTitle, config) {
    return new Promise(async (resolve, reject) => {
      try {
        const [sysConfigs] = await pool.query('SELECT `value` FROM system_config WHERE `key` = "app_logo"');
        if (sysConfigs.length > 0) {
          config.app_logo = sysConfigs[0].value;
        }

        // A4 Landscape: 841.89 x 595.28 points
        const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Background
        doc.rect(0, 0, 841.89, 595.28).fill('#ffffff');
        doc.rect(20, 20, 801.89, 555.28).lineWidth(5).stroke(config.brand_color || '#3b82f6');

        // Logo or Text content
        let logoDrawn = false;
        if (config.app_logo) {
          const logoPath = path.join(process.cwd(), config.app_logo);
          if (fs.existsSync(logoPath)) {
            try {
              doc.image(logoPath, (841.89 - 250) / 2, 50, { fit: [250, 70], align: 'center', valign: 'center' });
              logoDrawn = true;
            } catch (e) {
              console.error('Failed to load logo for certificate:', e);
            }
          }
        }
        
        if (!logoDrawn) {
          doc.fillColor(config.brand_color || '#3b82f6').fontSize(24).font('Helvetica-Bold')
             .text(config.institution_name || 'Brixify', 0, 80, { align: 'center' });
        }

        doc.fillColor('#000000').fontSize(40).font('Helvetica-Bold')
           .text('CERTIFICATE OF COMPLETION', 0, 150, { align: 'center' });

        // Decorative line
        doc.moveTo(200, 210).lineTo(641.89, 210).lineWidth(2).stroke(config.brand_color || '#3b82f6');

        doc.fontSize(16).font('Helvetica').fillColor('#666666')
           .text('This certifies that', 0, 240, { align: 'center' });

        doc.fontSize(45).font('Helvetica-Bold').fillColor('#1a1a2e')
           .text(studentName, 0, 280, { align: 'center' });

        doc.fontSize(16).font('Helvetica').fillColor('#666666')
           .text('has successfully completed the course', 0, 360, { align: 'center' });

        doc.fontSize(24).font('Helvetica-Bold').fillColor('#1a1a2e')
           .text(courseTitle, 0, 400, { align: 'center' });

        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.fontSize(14).font('Helvetica').fillColor('#666666')
           .text(`Awarded on ${dateStr}`, 0, 450, { align: 'center' });

        // QR Code
        // Assuming your public verification URL is standard
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-certificate?id=${certNumber}`;
        const qrBuffer = await QRCode.toBuffer(verifyUrl, { width: 100, margin: 1 });
        doc.image(qrBuffer, 680, 450, { width: 80 });

        // Footer details
        doc.fontSize(10).font('Helvetica').fillColor('#999999')
           .text(`Cert ID: ${certNumber}`, 50, 520);

        doc.fontSize(14).font('Helvetica-Bold').fillColor('#1a1a2e')
           .text(config.signatory_name || 'Director', 0, 500, { align: 'center' });
        doc.fontSize(12).font('Helvetica').fillColor('#666666')
           .text(config.signatory_title || 'Head of Education', 0, 520, { align: 'center' });

        doc.end();

        stream.on('finish', () => resolve(true));
        stream.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getMyCertificates(studentId) {
    const [rows] = await pool.query(
      `SELECT c.id, c.course_id, c.cert_number, c.issued_at, c.status, co.title as course_title, c.pdf_path, u.name as student_name
       FROM certificates c
       JOIN courses co ON c.course_id = co.id
       JOIN users u ON c.student_id = u.id
       WHERE c.student_id = ?
       ORDER BY c.issued_at DESC`,
      [studentId]
    );
    return rows;
  }

  async verifyCertificate(certNumber, ipAddress = null) {
    const [rows] = await pool.query(
      `SELECT c.*, co.title as course_title, u.name as student_name, 
              cfg.institution_name, cfg.logo_url
       FROM certificates c
       JOIN courses co ON c.course_id = co.id
       JOIN users u ON c.student_id = u.id
       CROSS JOIN cert_template_config cfg WHERE cfg.id = 1
       AND c.cert_number = ?`,
      [certNumber]
    );

    if (rows.length === 0) {
      return { verified: false, message: 'Certificate not found' };
    }

    const cert = rows[0];

    // Log verification
    await pool.query(
      'INSERT INTO cert_verification_logs (id, cert_id, ip_address) VALUES (?, ?, ?)',
      [uuidv4(), cert.id, ipAddress]
    );

    const studentName = cert.student_name;

    if (cert.status === 'revoked') {
      return {
        verified: false,
        status: 'revoked',
        student_name: studentName,
        course_name: cert.course_title,
        issued_at: cert.issued_at,
        revoked_at: cert.revoked_at
      };
    }

    return {
      verified: true,
      status: 'active',
      student_name: studentName,
      course_name: cert.course_title,
      issued_at: cert.issued_at,
      institution_name: cert.institution_name,
      institution_logo_url: cert.logo_url
    };
  }

  // Admin Actions
  async getAllCertificates(userId, role) {
    let query = `SELECT c.id, c.cert_number, c.issued_at, c.status, c.revoked_at, c.pdf_path,
              co.title as course_title, u.name as student_name, u.email,
              c.student_id, c.course_id
       FROM certificates c
       JOIN courses co ON c.course_id = co.id
       JOIN users u ON c.student_id = u.id`;
    
    const params = [];
    if (role === 'tutor') {
      query += ` WHERE co.tutor_id = ?`;
      params.push(userId);
    }
    
    query += ` ORDER BY c.issued_at DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  }

  async revoke(certNumber) {
    await pool.query(
      'UPDATE certificates SET status = ?, revoked_at = NOW() WHERE cert_number = ?',
      ['revoked', certNumber]
    );
    return true;
  }

  async reissue(certNumber) {
    const [certs] = await pool.query('SELECT exam_attempt_id FROM certificates WHERE cert_number = ?', [certNumber]);
    if (certs.length === 0) throw new Error('Cert not found');
    
    // Revoke old
    await this.revoke(certNumber);
    
    // Trick to bypass idempotency: we could generate directly, or we can just call createPDF again.
    // For proper idempotency bypass, we need to temporarily delete or rename the old record, or just directly generate.
    // Let's generate a new one directly.
    const attemptId = certs[0].exam_attempt_id;
    if (!attemptId) throw new Error('Attempt ID missing for re-issue');

    // Remove old from DB to allow regenerate logic to work easily (or just bypass)
    // Actually, setting it to revoked doesn't bypass idempotency check in generate() currently.
    // Let's modify generate() or just do a custom logic here.
    
    // Custom logic to reissue:
    const [attempts] = await pool.query(
      `SELECT ea.*, e.title as exam_title, c.id as course_id, c.title as course_title, u.id as student_id, u.name
       FROM exam_attempts ea
       JOIN exams e ON ea.exam_id = e.id
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON ea.student_id = u.id
       WHERE ea.id = ?`,
      [attemptId]
    );
    
    if (attempts.length === 0) throw new Error('Attempt not found');
    const attempt = attempts[0];
    const studentName = attempt.name;

    let newCertNumber = generateCertNumber();
    let isUnique = false;
    while (!isUnique) {
      const [check] = await pool.query('SELECT id FROM certificates WHERE cert_number = ?', [newCertNumber]);
      if (check.length === 0) isUnique = true;
      else newCertNumber = generateCertNumber();
    }

    const [configs] = await pool.query('SELECT * FROM cert_template_config WHERE id = 1');
    const config = configs[0] || {};
    const pdfDir = path.join(process.cwd(), 'uploads', 'certificates');
    const pdfPathLocal = path.join(pdfDir, `${newCertNumber}.pdf`);
    const pdfUrl = `/uploads/certificates/${newCertNumber}.pdf`;

    await this.createPDF(pdfPathLocal, newCertNumber, studentName, attempt.course_title, config);

    await pool.query(
      `INSERT INTO certificates (id, student_id, course_id, exam_attempt_id, cert_number, pdf_path)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), attempt.student_id, attempt.course_id, attemptId, newCertNumber, pdfUrl]
    );

    return { newCertNumber, pdfUrl };
  }

  async issueManual(studentId, courseId) {
    // 1. Fetch Student and Course details
    const [students] = await pool.query('SELECT name, email FROM users WHERE id = ?', [studentId]);
    const [courses] = await pool.query('SELECT title FROM courses WHERE id = ?', [courseId]);

    if (students.length === 0) throw new Error('Student not found');
    if (courses.length === 0) throw new Error('Course not found');

    const studentName = students[0].name;
    const courseTitle = courses[0].title;

    // Check if certificate already exists for this student & course
    const [existing] = await pool.query(
      'SELECT id, cert_number, pdf_path FROM certificates WHERE student_id = ? AND course_id = ? AND status = "active" LIMIT 1',
      [studentId, courseId]
    );
    if (existing.length > 0) {
      return {
        certId: existing[0].id,
        certNumber: existing[0].cert_number,
        pdfUrl: existing[0].pdf_path,
        message: 'Certificate already exists'
      };
    }

    // 1.5 Verify exam completion if the course has an exam
    const [exams] = await pool.query('SELECT id FROM exams WHERE course_id = ?', [courseId]);
    if (exams.length > 0) {
      const examId = exams[0].id;
      const [attempts] = await pool.query('SELECT id FROM exam_attempts WHERE exam_id = ? AND student_id = ? AND passed = 1', [examId, studentId]);
      if (attempts.length === 0) {
        throw new Error('Student has not passed the required exam for this course.');
      }
    }

    // 2. Generate unique cert number
    let certNumber = generateCertNumber();
    let isUnique = false;
    while (!isUnique) {
      const [check] = await pool.query('SELECT id FROM certificates WHERE cert_number = ?', [certNumber]);
      if (check.length === 0) isUnique = true;
      else certNumber = generateCertNumber();
    }

    // 3. Fetch Config
    const [configs] = await pool.query('SELECT * FROM cert_template_config WHERE id = 1');
    const config = configs[0] || {};

    // 4. Generate PDF
    const pdfDir = path.join(process.cwd(), 'uploads', 'certificates');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    const pdfPathLocal = path.join(pdfDir, `${certNumber}.pdf`);
    const pdfUrl = `/uploads/certificates/${certNumber}.pdf`;

    await this.createPDF(pdfPathLocal, certNumber, studentName, courseTitle, config);

    // 5. DB Record
    const certId = uuidv4();
    await pool.query(
      `INSERT INTO certificates (id, student_id, course_id, exam_attempt_id, cert_number, pdf_path)
       VALUES (?, ?, ?, NULL, ?, ?)`,
      [certId, studentId, courseId, certNumber, pdfUrl]
    );

    return { certId, certNumber, pdfUrl };
  }

  async updateCertificate(certNumber, studentId, courseId) {
    const [certs] = await pool.query('SELECT pdf_path FROM certificates WHERE cert_number = ?', [certNumber]);
    if (certs.length === 0) throw new Error('Certificate not found');

    const [students] = await pool.query('SELECT name FROM users WHERE id = ?', [studentId]);
    const [courses] = await pool.query('SELECT title FROM courses WHERE id = ?', [courseId]);

    if (students.length === 0) throw new Error('Student not found');
    if (courses.length === 0) throw new Error('Course not found');

    const studentName = students[0].name;
    const courseTitle = courses[0].title;

    const [configs] = await pool.query('SELECT * FROM cert_template_config WHERE id = 1');
    const config = configs[0] || {};

    // Remove old PDF
    const oldPdfPath = path.join(process.cwd(), certs[0].pdf_path);
    if (fs.existsSync(oldPdfPath)) {
      fs.unlinkSync(oldPdfPath);
    }

    const pdfDir = path.join(process.cwd(), 'uploads', 'certificates');
    const pdfPathLocal = path.join(pdfDir, `${certNumber}.pdf`);
    const pdfUrl = `/uploads/certificates/${certNumber}.pdf`;

    await this.createPDF(pdfPathLocal, certNumber, studentName, courseTitle, config);

    await pool.query(
      'UPDATE certificates SET student_id = ?, course_id = ?, pdf_path = ? WHERE cert_number = ?',
      [studentId, courseId, pdfUrl, certNumber]
    );

    return { certNumber, pdfUrl };
  }

  async deleteCertificate(certNumber) {
    const [certs] = await pool.query('SELECT pdf_path FROM certificates WHERE cert_number = ?', [certNumber]);
    if (certs.length === 0) throw new Error('Certificate not found');

    const pdfPath = path.join(process.cwd(), certs[0].pdf_path);
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    await pool.query('DELETE FROM certificates WHERE cert_number = ?', [certNumber]);
    return true;
  }

  async generatePublicExamCertificate(attemptId) {
    // 1. Fetch Attempt, Exam, Result, Candidate details
    const [attempts] = await pool.query(
      `SELECT r.*, a.guest_name, a.candidate_id, e.name as exam_name, e.total_marks, e.enable_certificate
       FROM public_exam_results r
       JOIN public_exam_attempts a ON r.attempt_id = a.id
       JOIN public_exams e ON r.exam_id = e.id
       WHERE r.attempt_id = ?`,
      [attemptId]
    );

    if (attempts.length === 0) {
      throw new Error('Valid passed exam attempt not found');
    }

    const attempt = attempts[0];
    if (!attempt.passed) {
      throw new Error('Attempt did not pass');
    }

    if (!attempt.enable_certificate) {
      throw new Error('Certificates are disabled for this exam');
    }

    // 2. Idempotency Check
    const [existing] = await pool.query(
      'SELECT id, cert_number, pdf_path FROM certificates WHERE exam_attempt_id = ?',
      [attemptId]
    );
    if (existing.length > 0) {
      return { message: 'Certificate already exists', certNumber: existing[0].cert_number, pdfUrl: existing[0].pdf_path };
    }

    // 3. Generate unique cert number
    let certNumber = `CERT-PE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let isUnique = false;
    while (!isUnique) {
      const [check] = await pool.query('SELECT id FROM certificates WHERE cert_number = ?', [certNumber]);
      if (check.length === 0) isUnique = true;
      else certNumber = `CERT-PE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // 4. Fetch Custom Certificate Settings
    const [customCerts] = await pool.query('SELECT * FROM public_exam_certificates WHERE exam_id = ?', [attempt.exam_id]);
    const custom = customCerts[0] || {};

    const pdfDir = path.join(process.cwd(), 'uploads', 'public_certificates');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfFilename = `cert-${attemptId}.pdf`;
    const pdfPathLocal = path.join(pdfDir, pdfFilename);
    const pdfUrl = `/uploads/public_certificates/${pdfFilename}`;

    // 5. Generate PDF
    await this.createPublicExamPDF(pdfPathLocal, attemptId, attempt, custom);

    // 6. DB Record
    const certId = uuidv4();
    await pool.query(
      `INSERT INTO certificates (id, student_id, candidate_id, course_id, exam_attempt_id, cert_number, pdf_path, status)
       VALUES (?, NULL, ?, NULL, ?, ?, ?, 'active')`,
      [certId, attempt.candidate_id || null, attemptId, certNumber, pdfUrl]
    );

    return { certId, certNumber, pdfUrl };
  }

  async createPublicExamPDF(filePath, attemptId, data, custom) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Styling configuration (harmonious colors)
        const primaryColor = '#5624D0'; // Sleek Udemy Purple
        const goldAccent = '#E59819';   // Premium Gold
        const darkText = '#1A1A2E';

        // Outer premium borders
        doc.rect(15, 15, 811.89, 565.28).fill('#ffffff');
        doc.rect(25, 25, 791.89, 545.28).lineWidth(4).stroke(primaryColor);
        doc.rect(32, 32, 777.89, 531.28).lineWidth(1.5).stroke(goldAccent);

        // Render Custom Logo if present, otherwise default text
        let logoDrawn = false;
        if (custom.logo_url && custom.logo_url.startsWith('data:image')) {
          try {
            const logoData = custom.logo_url.split(',')[1];
            doc.image(Buffer.from(logoData, 'base64'), 395, 45, { width: 50 });
            logoDrawn = true;
          } catch (err) {
            console.warn('Failed to render base64 logo in PDF:', err.message);
          }
        }
        
        if (!logoDrawn) {
          // Default text header watermark
          doc.fontSize(10).font('Helvetica-Bold').fillColor('#C2C2C2')
             .text('BRIXIFY PUBLIC PRACTICE PORTAL · PRACTICE COMPLETION CERTIFICATE', 0, 50, { align: 'center', characterSpacing: 1.5 });
        }

        // Certificate Title
        const certTitle = custom.title || 'Practice Exam Certificate';
        doc.fontSize(36).font('Helvetica-Bold').fillColor(primaryColor)
           .text(certTitle, 0, 110, { align: 'center' });

        // Subtitle warnings
        doc.fontSize(11).font('Helvetica-Oblique').fillColor('#E15241')
           .text('Not Official Certification · Practice Completion Only', 0, 158, { align: 'center' });

        // Decorative line
        doc.moveTo(250, 185).lineTo(591.89, 185).lineWidth(1.5).stroke(goldAccent);

        // Main body text
        doc.fontSize(16).font('Helvetica').fillColor('#666666')
           .text('This is to certify that the public visitor', 0, 220, { align: 'center' });

        // Student/Guest Name
        doc.fontSize(36).font('Helvetica-Bold').fillColor(darkText)
           .text(data.guest_name, 0, 255, { align: 'center' });

        doc.fontSize(16).font('Helvetica').fillColor('#666666')
           .text('has successfully completed the practice entrance exam', 0, 320, { align: 'center' });

        // Exam Name
        doc.fontSize(22).font('Helvetica-Bold').fillColor(primaryColor)
           .text(data.exam_name, 0, 355, { align: 'center' });

        // Score & Percentage
        doc.fontSize(14).font('Helvetica').fillColor('#444444')
           .text(`Scoring ${data.score} out of ${data.total_marks} marks (${data.percentage}%)`, 0, 395, { align: 'center' });

        // Completed Date
        const completedDate = new Date(data.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        doc.fontSize(13).font('Helvetica').fillColor('#666666')
           .text(`Awarded on ${completedDate}`, 0, 435, { align: 'center' });

        // QR Code for verification
        const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/public-exams`;
        const qrBuffer = await QRCode.toBuffer(portalUrl, { width: 90, margin: 1 });
        doc.image(qrBuffer, 690, 435, { width: 75 });
        doc.fontSize(8).font('Helvetica').fillColor('#999999')
           .text('Scan to take exams', 680, 515, { width: 95, align: 'center' });

        // Footer info
        doc.fontSize(9).font('Helvetica').fillColor('#A2A2A2')
           .text(`Attempt Verification ID: ${attemptId}`, 50, 520);

        // Custom Signature image or default signatory text
        let sigDrawn = false;
        if (custom.signature_url && custom.signature_url.startsWith('data:image')) {
          try {
            const sigData = custom.signature_url.split(',')[1];
            doc.image(Buffer.from(sigData, 'base64'), 380, 470, { width: 80 });
            sigDrawn = true;
          } catch (err) {
            console.warn('Failed to render signature in PDF:', err.message);
          }
        }
        
        if (!sigDrawn) {
          doc.fontSize(12).font('Helvetica-Bold').fillColor(darkText)
             .text('Brixify Practice Portal Team', 300, 500, { align: 'center' });
        }

        const signatoryLabel = custom.footer_text || 'Authorized Practice Signatory';
        doc.fontSize(10).font('Helvetica').fillColor('#666666')
           .text(signatoryLabel, 300, 518, { align: 'center' });

        doc.end();

        stream.on('finish', () => resolve(true));
        stream.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Config
  async getConfig() {
    const [rows] = await pool.query('SELECT * FROM cert_template_config WHERE id = 1');
    return rows[0] || {};
  }

  async updateConfig(data) {
    const { institution_name, brand_color, signatory_name, signatory_title } = data;
    await pool.query(
      `UPDATE cert_template_config 
       SET institution_name = ?, brand_color = ?, signatory_name = ?, signatory_title = ?
       WHERE id = 1`,
      [institution_name, brand_color, signatory_name, signatory_title]
    );
    return true;
  }
}

export default new CertificateService();
