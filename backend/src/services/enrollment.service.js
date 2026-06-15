import { pool } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import emailService from './email.service.js';
import { createNotification } from './notification.service.js';

class EnrollmentService {
  /**
   * Helper to generate a strong random password
   */
  generateTempPassword() {
    const charsLowerCase = "abcdefghijklmnopqrstuvwxyz";
    const charsUpperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charsNumbers = "0123456789";
    const charsSpecial = "!@#$%^&*";
    
    let password = "";
    password += charsLowerCase.charAt(Math.floor(Math.random() * charsLowerCase.length));
    password += charsUpperCase.charAt(Math.floor(Math.random() * charsUpperCase.length));
    password += charsNumbers.charAt(Math.floor(Math.random() * charsNumbers.length));
    password += charsSpecial.charAt(Math.floor(Math.random() * charsSpecial.length));
    
    const allChars = charsLowerCase + charsUpperCase + charsNumbers + charsSpecial;
    for (let i = 0; i < 4; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    return password;
  }

  /**
   * Core enrollment logic shared by CRM, Self-Enroll, and Manual Enroll
   */
  async enrollStudent({ leadId, studentData, courseId, pricing, payment, convertedBy, leadSource }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let studentId = studentData?.id;
      let tempPassword = null;
      let readableStudentId = null;

      // 1. Create or Identify User
      if (!studentId) {
        // Check if user already exists by email
        const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [studentData.email]);
        if (existing.length > 0) {
          studentId = existing[0].id;
          // Get existing student_id if profile exists
          const [profile] = await connection.query('SELECT student_id FROM student_profiles WHERE user_id = ?', [studentId]);
          if (profile.length > 0) {
            readableStudentId = profile[0].student_id;
          } else {
            // Profile doesn't exist, create it (shouldn't happen but just in case)
            const currentYear = new Date().getFullYear();
            const prefix = `STU-${currentYear}-`;
            const [rows] = await connection.query(
              'SELECT student_id FROM student_profiles WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1',
              [`${prefix}%`]
            );
            let nextNum = 1;
            if (rows.length > 0 && rows[0].student_id) {
              const lastId = rows[0].student_id;
              const parts = lastId.split('-');
              if (parts.length === 3) {
                const lastNum = parseInt(parts[2], 10);
                if (!isNaN(lastNum)) {
                  nextNum = lastNum + 1;
                }
              }
            }
            readableStudentId = `${prefix}${String(nextNum).padStart(3, '0')}`;
            await connection.query(
              'INSERT INTO student_profiles (user_id, student_id, converted_by, lead_source) VALUES (?, ?, ?, ?)',
              [studentId, readableStudentId, convertedBy || null, leadSource || null]
            );
          }
        } else {
          studentId = uuidv4();
          tempPassword = this.generateTempPassword();
          const hashedPassword = await bcrypt.hash(tempPassword, 10);
          
          await connection.query(
            'INSERT INTO users (id, role, name, email, password_hash, temp_password, phone, status, force_password_change) VALUES (?, "student", ?, ?, ?, ?, ?, "active", 1)',
            [studentId, studentData.name, studentData.email, hashedPassword, tempPassword, studentData.phone]
          );

          // Generate sequential Student ID: STU-YYYY-NNN
          const currentYear = new Date().getFullYear();
          const prefix = `STU-${currentYear}-`;
          const [rows] = await connection.query(
            'SELECT student_id FROM student_profiles WHERE student_id LIKE ? ORDER BY student_id DESC LIMIT 1',
            [`${prefix}%`]
          );
          let nextNum = 1;
          if (rows.length > 0 && rows[0].student_id) {
            const lastId = rows[0].student_id;
            const parts = lastId.split('-');
            if (parts.length === 3) {
              const lastNum = parseInt(parts[2], 10);
              if (!isNaN(lastNum)) {
                nextNum = lastNum + 1;
              }
            }
          }
          readableStudentId = `${prefix}${String(nextNum).padStart(3, '0')}`;

          // Create student profile
          await connection.query(
            'INSERT INTO student_profiles (user_id, student_id, converted_by, lead_source) VALUES (?, ?, ?, ?)',
            [studentId, readableStudentId, convertedBy || null, leadSource || null]
          );
        }
      } else {
        const [profile] = await connection.query('SELECT student_id FROM student_profiles WHERE user_id = ?', [studentId]);
        if (profile.length > 0) {
          readableStudentId = profile[0].student_id;
        }
      }

      // 2. Check for existing enrollment
      const [existingEnrollment] = await connection.query(
        'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? AND status IN ("active", "completed")',
        [studentId, courseId]
      );
      if (existingEnrollment.length > 0) {
        throw new Error('ALREADY_ENROLLED');
      }

      // 3. Create Enrollment
      const enrollmentId = uuidv4();
      await connection.query(
        'INSERT INTO enrollments (id, student_id, course_id, status) VALUES (?, ?, ?, "active")',
        [enrollmentId, studentId, courseId]
      );

      // 3. Create Invoice
      const invoiceId = uuidv4();
      const amount = pricing.amount;
      const amountPaid = payment.amountPaid || 0;
      const balanceDue = amount - amountPaid;
      const paymentStatus = balanceDue <= 0 ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending');

      await connection.query(
        `INSERT INTO invoices (id, student_id, course_id, amount, total_fee, amount_paid, balance_due, balance_amount, payment_mode, payment_status, gateway_order_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, studentId, courseId, amount, amount, amountPaid, balanceDue, balanceDue, payment.mode, paymentStatus, payment.gatewayOrderId]
      );

      // 4. Record Payment Transaction
      if (amountPaid > 0) {
        const payMode = payment.mode === 'online' ? 'card' : (payment.offlineType || 'cash');
        const payRef = payment.mode === 'online' ? payment.gatewayOrderId : payment.reference;
        await connection.query(
          'INSERT INTO invoice_payments (id, invoice_id, amount, mode, reference, installment_number) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), invoiceId, amountPaid, payMode, payRef, 1]
        );
      }

      // 5. Update Lead Status if applicable
      if (leadId) {
        await connection.query('UPDATE leads SET status = "converted" WHERE id = ?', [leadId]);
        // Log activity
        await connection.query(
          'INSERT INTO lead_activities (id, lead_id, type, content) VALUES (?, ?, "status_change", ?)',
          [uuidv4(), leadId, `Converted to student. Enrollment ID: ${enrollmentId}`]
        );
      }

      await connection.commit();

      // Send Enrollment & Payment Notifications
      try {
        const [courseRows] = await pool.query('SELECT title FROM courses WHERE id = ?', [courseId]);
        const [userRows] = await pool.query('SELECT name FROM users WHERE id = ?', [studentId]);
        
        if (courseRows.length > 0 && userRows.length > 0) {
          const courseTitle = courseRows[0].title;
          const studentName = userRows[0].name;
          
          let title = '';
          let body = '';
          
          if (paymentStatus === 'paid') {
            title = 'Course Fully Paid: ' + courseTitle;
            body = `Hi ${studentName}, your payment for ${courseTitle} is now complete. Total paid: ₹${amount.toLocaleString()}.`;
          } else if (paymentStatus === 'partial') {
            title = 'Partial Payment Received';
            body = `Hi ${studentName}, we have received your initial payment of ₹${amountPaid.toLocaleString()} for ${courseTitle}. Your remaining balance is ₹${balanceDue.toLocaleString()}.`;
            
            // Also send "Balance payment due" notification
            setTimeout(async () => {
              try {
                await createNotification({
                  userId: studentId,
                  type: 'system',
                  title: 'Balance Payment Due: ' + courseTitle,
                  message: `Hi ${studentName}, a balance payment of ₹${balanceDue.toLocaleString()} is due for ${courseTitle}. Please complete it from your Payments section.`,
                  link: '/dashboard/student/payments',
                  emailNotify: true
                });
              } catch (err) {
                console.error('Failed to send balance due notification:', err);
              }
            }, 1000);
          } else if (amountPaid === 0) {
            title = 'Invoice Created';
            body = `Hi ${studentName}, an invoice has been generated for ${courseTitle}. Amount due: ₹${amount.toLocaleString()}.`;
          }
          
          if (title && body) {
            await createNotification({
              userId: studentId,
              type: 'system',
              title,
              message: body,
              link: '/dashboard/student/payments',
              emailNotify: true
            });
          }

          // Notify Tutor
          const [tutorRows] = await pool.query('SELECT created_by as tutor_id FROM courses WHERE id = ?', [courseId]);
          if (tutorRows.length > 0 && tutorRows[0].tutor_id) {
            await createNotification({
              userId: tutorRows[0].tutor_id,
              type: 'info',
              title: 'New Student Enrolled',
              message: `${studentName} has successfully enrolled in ${courseTitle}.`,
              link: '/dashboard/tutor/courses',
              emailNotify: false
            });
          }
        }
      } catch (notifErr) {
        console.error('Failed to send enrollment notifications:', notifErr);
      }

      // 6. Send Welcome Email (Async, don't block response)
      if (tempPassword) {
        const [course] = await pool.query('SELECT title FROM courses WHERE id = ?', [courseId]);
        const courseName = course[0]?.title || 'Selected Course';
        
        emailService.sendWelcomeEmail(
          { name: studentData.name, email: studentData.email },
          { password: tempPassword },
          courseName
        );

        // Also create an in-app system notification
        await createNotification({
          userId: studentId,
          type: 'system',
          title: 'Welcome to AEMS!',
          message: `Your account has been created successfully. Your temporary password is: ${tempPassword}. Please change it upon your first login.`,
          link: '/settings',
          emailNotify: false // Email is already handled by emailService
        });
      }

      return { studentId, enrollmentId, invoiceId, tempPassword, readableStudentId, email: studentData.email };

    } catch (error) {
      await connection.rollback();
      console.error('Enrollment Transaction Failed:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new EnrollmentService();
