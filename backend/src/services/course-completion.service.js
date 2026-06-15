import { pool } from '../db/connection.js';
import certificateService from './certificate.service.js';
import emailService from './email.service.js';

class CourseCompletionService {
  /**
   * Validates if a student has met all completion criteria for a course.
   * If yes, it completes the enrollment, issues the certificate, and sends an email.
   * @param {string} studentId 
   * @param {string} courseId 
   * @param {string} enrollmentId 
   * @returns {boolean} True if course was completed in this run, false otherwise.
   */
  async validateAndCompleteCourse(studentId, courseId, enrollmentId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Fetch enrollment
      const [enrollments] = await connection.query(
        'SELECT * FROM enrollments WHERE id = ? FOR UPDATE',
        [enrollmentId]
      );

      if (enrollments.length === 0) {
        await connection.rollback();
        return false;
      }

      const enrollment = enrollments[0];

      // If already fully processed, skip
      if (enrollment.status === 'completed' && enrollment.email_sent_status) {
        await connection.rollback();
        return false;
      }

      // 2. Validate lessons completion (handled by POST /progress usually, but we check percentage)
      if (enrollment.completion_percentage < 100) {
        await connection.rollback();
        return false;
      }

      // 3. Validate required assignments (Mock logic: if there are assignments, check if submitted)
      const [pendingAssignments] = await connection.query(`
        SELECT a.id FROM assignments a 
        WHERE a.course_id = ? 
        AND a.id NOT IN (SELECT assignment_id FROM assignment_submissions WHERE student_id = ?)
      `, [courseId, studentId]);

      if (pendingAssignments.length > 0) {
        await connection.rollback();
        return false; // Not all assignments submitted
      }

      // 4. Validate Exam
      const [exams] = await connection.query('SELECT id FROM exams WHERE course_id = ?', [courseId]);
      if (exams.length > 0) {
        const examId = exams[0].id;
        const [passedAttempts] = await connection.query(
          'SELECT id FROM exam_attempts WHERE exam_id = ? AND student_id = ? AND passed = 1',
          [examId, studentId]
        );
        if (passedAttempts.length === 0) {
          await connection.rollback();
          return false; // Exam required but not passed
        }
      }

      // ALL CONDITIONS MET
      const completionDate = new Date();

      // 5. Generate Certificate (if applicable)
      let certificateDetails = null;
      let certGenerated = false;

      // Check Option B (Restrict certificate generation until fully paid)
      const [configs] = await connection.query('SELECT value FROM system_config WHERE `key` = "payment_restrict_certificate"');
      const restrictCert = configs[0]?.value === 'true';
      let canIssueCert = true;

      if (restrictCert) {
        const [invoices] = await connection.query(
          'SELECT payment_status FROM invoices WHERE student_id = ? AND course_id = ?',
          [studentId, courseId]
        );
        if (invoices.length > 0 && invoices[0].payment_status !== 'paid') {
          canIssueCert = false;
        }
      }

      if (canIssueCert) {
        try {
          // certificateService.issueManual checks exam internally as well and creates PDF
          certificateDetails = await certificateService.issueManual(studentId, courseId);
          certGenerated = true;
        } catch (err) {
          if (err.message === 'Certificate already exists') {
            // fetch existing details
            const [existing] = await connection.query('SELECT pdf_path as pdfUrl FROM certificates WHERE student_id = ? AND course_id = ?', [studentId, courseId]);
            if (existing.length > 0) {
              certificateDetails = existing[0];
              certGenerated = true;
            }
          } else if (err.message !== 'Course not found') {
            console.warn('Certificate generation skipped or failed:', err.message);
          }
        }
      } else {
        console.log(`Certificate generation restricted for student ${studentId} course ${courseId} due to balance payment rules.`);
      }

      // 6. Update Enrollment
      await connection.query(`
        UPDATE enrollments 
        SET status = 'completed', 
            completed_at = ?, 
            certificate_generated = ?
        WHERE id = ?
      `, [completionDate, certGenerated ? 1 : 0, enrollmentId]);

      await connection.commit();

      // 7. Send Email Asynchronously
      if (!enrollment.email_sent_status) {
        this.sendCompletionEmail(studentId, courseId, completionDate, certificateDetails, enrollmentId);
      }

      return true;

    } catch (error) {
      await connection.rollback();
      console.error('Error in validateAndCompleteCourse:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async sendCompletionEmail(studentId, courseId, completionDate, certificateDetails, enrollmentId) {
    try {
      const [users] = await pool.query(`
        SELECT u.name, u.email, up.avatar_url 
        FROM users u 
        LEFT JOIN user_profiles up ON u.id = up.user_id 
        WHERE u.id = ?
      `, [studentId]);
      const [courses] = await pool.query('SELECT title FROM courses WHERE id = ?', [courseId]);

      if (users.length > 0 && courses.length > 0) {
        const student = users[0];
        const course = courses[0];
        await emailService.sendCourseCompletionEmail(student, course.title, completionDate, certificateDetails);

        // Mark as sent
        await pool.query('UPDATE enrollments SET email_sent_status = 1 WHERE id = ?', [enrollmentId]);
      }
    } catch (err) {
      console.error('Failed to send completion email:', err);
    }
  }
}

export default new CourseCompletionService();
