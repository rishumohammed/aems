import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/connection.js';
import emailService from './email.service.js';
import certificateService from './certificate.service.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

class ExamService {
  // ─── Session Token ──────────────────────────────────────────────────────────

  /**
   * Generate a short-lived JWT scoped to this exam attempt.
   * Expires exactly at exam end + 5 min buffer.
   */
  generateExamSessionToken(attemptId, studentId, examId, durationMinutes) {
    const expiresIn = (durationMinutes + 5) * 60; // seconds
    const token = jwt.sign(
      { attemptId, studentId, examId },
      process.env.JWT_ACCESS_SECRET + '_exam',
      { expiresIn }
    );
    return { token, hash: hashToken(token), expiresIn };
  }

  // ─── Eligibility ─────────────────────────────────────────────────────────────

  /**
   * Check if a student is eligible to take an exam.
   * Rules: course must be completed, attempts must not be exhausted.
   */
  async checkEligibility(studentId, examId) {
    const [exams] = await pool.query(
      'SELECT e.*, c.id as course_id FROM exams e LEFT JOIN courses c ON e.course_id = c.id WHERE e.id = ?',
      [examId]
    );
    if (exams.length === 0) throw new Error('Exam not found');
    const exam = exams[0];

    if (exam.status !== 'published') throw new Error('Exam is not active');

    // If it's a course exam, verify enrollment AND completion
    if (exam.course_id) {
      const [enrollment] = await pool.query(
        "SELECT id, status FROM enrollments WHERE student_id = ? AND course_id = ?",
        [studentId, exam.course_id]
      );
      if (enrollment.length === 0) {
        throw new Error('You must be enrolled in the course to take the exam');
      }
      if (enrollment[0].status !== 'completed') {
        throw new Error('You must complete the course before taking the exam.');
      }

      // Check Option C (Restrict final exam until fully paid)
      const [configs] = await pool.query('SELECT value FROM system_config WHERE `key` = "payment_restrict_exam"');
      const restrictExam = configs[0]?.value === 'true';
      if (restrictExam) {
        const [invoices] = await pool.query(
          'SELECT payment_status FROM invoices WHERE student_id = ? AND course_id = ?',
          [studentId, exam.course_id]
        );
        if (invoices.length > 0 && invoices[0].payment_status !== 'paid') {
          throw new Error('You must pay the full course fee before taking the final exam.');
        }
      }
    }

    // Count attempts
    const [attempts] = await pool.query(
      "SELECT COUNT(*) as count FROM exam_attempts WHERE student_id = ? AND exam_id = ? AND status IN ('submitted','graded','pending_manual_review')",
      [studentId, examId]
    );
    if (attempts[0].count >= exam.max_attempts) {
      throw new Error(`Maximum attempts (${exam.max_attempts}) reached`);
    }

    return { eligible: true, exam, attemptsUsed: attempts[0].count };
  }

  // ─── Grading ─────────────────────────────────────────────────────────────────

  /**
   * Auto-grade MCQ and T/F questions. Mark short/long as pending.
   * Returns { autoScore, totalMarks, pendingManualReview }
   */
  async gradeSubmission(attemptId, answers) {
    const [questions] = await pool.query(
      'SELECT id, type, correct_answer, marks FROM exam_questions WHERE exam_id = (SELECT exam_id FROM exam_attempts WHERE id = ?)',
      [attemptId]
    );

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let autoScore = 0;
      let totalMarks = 0;
      let hasPending = false;

      for (const q of questions) {
        totalMarks += q.marks;
        const studentAnswer = answers.find(a => a.question_id === q.id);
        const answerId = uuidv4();

        if (q.type === 'mcq' || q.type === 'truefalse') {
          const isCorrect = studentAnswer?.answer?.toString().trim().toLowerCase() ===
            q.correct_answer?.toString().trim().toLowerCase();
          const marksAwarded = isCorrect ? q.marks : 0;
          autoScore += marksAwarded;

          await connection.query(
            'INSERT INTO exam_answers (id, attempt_id, question_id, answer_text, marks_awarded, is_correct) VALUES (?, ?, ?, ?, ?, ?)',
            [answerId, attemptId, q.id, studentAnswer?.answer || null, marksAwarded, isCorrect]
          );
        } else {
          // short / long — pending manual review
          hasPending = true;
          await connection.query(
            'INSERT INTO exam_answers (id, attempt_id, question_id, answer_text, marks_awarded) VALUES (?, ?, ?, ?, NULL)',
            [answerId, attemptId, q.id, studentAnswer?.answer || null]
          );
        }
      }

      await connection.commit();
      return { autoScore, totalMarks, pendingManualReview: hasPending };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  // ─── Certificate ──────────────────────────────────────────────────────────────

  /**
   * Issue a certificate for a passed attempt.
   * Idempotent — skips if already issued.
   */
  async issueCertificate(attemptId) {
    try {
      const result = await certificateService.generate(attemptId);
      
      // Attempt to send email Notification 
      const [attempts] = await pool.query(
        'SELECT ea.student_id, e.course_id FROM exam_attempts ea JOIN exams e ON ea.exam_id = e.id WHERE ea.id = ?',
        [attemptId]
      );
      if (attempts.length > 0) {
        const attempt = attempts[0];
        const [users] = await pool.query('SELECT name, email FROM users WHERE id = ?', [attempt.student_id]);
        const [courses] = await pool.query('SELECT title FROM courses WHERE id = ?', [attempt.course_id]);
        if (users.length > 0 && courses.length > 0 && result.certNumber) {
          emailService.sendEmail({
            to: users[0].email,
            subject: `🎓 Certificate Issued — ${courses[0].title}`,
            html: `<h2>Congratulations ${users[0].name}!</h2>
             <p>You have successfully passed the <strong>${courses[0].title}</strong> exam.</p>
             <p>Your certificate number is: <strong>${result.certNumber}</strong></p>
             <p>You can download your PDF certificate from your AEMS dashboard.</p>`
          }).catch(err => console.warn('Certificate email failed:', err.message));
        }
      }
      
      return result;
    } catch (err) {
      console.error('Failed to issue certificate via service:', err);
      throw err;
    }
  }
}

export default new ExamService();
