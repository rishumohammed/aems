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
      institution_name: 'AEMS Academy',
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
        // A4 Landscape: 841.89 x 595.28 points
        const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Background
        doc.rect(0, 0, 841.89, 595.28).fill('#ffffff');
        doc.rect(20, 20, 801.89, 555.28).lineWidth(5).stroke(config.brand_color || '#3b82f6');

        // Text content
        doc.fillColor(config.brand_color || '#3b82f6').fontSize(24).font('Helvetica-Bold')
           .text(config.institution_name || 'AEMS Academy', 0, 80, { align: 'center' });

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
              co.title as course_title, u.name as student_name, u.email
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
