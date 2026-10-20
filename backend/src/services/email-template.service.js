import { pool } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import emailService from './email.service.js';

export const DEFAULT_EMAIL_TEMPLATES = [
  {
    code: 'student_welcome',
    name: 'Student Welcome & Credentials',
    category: 'lms',
    description: 'Dispatched automatically when a student account is created or enrolled, containing their initial login credentials and course details.',
    subject: 'Your Student Account Has Been Created — Brixify',
    placeholders: [
      { key: '{{NAME}}', description: 'Student full name' },
      { key: '{{EMAIL}}', description: 'Student login email / username' },
      { key: '{{PASSWORD}}', description: 'Student temporary password' },
      { key: '{{COURSE_NAME}}', description: 'Name of the enrolled course' },
      { key: '{{LOGIN_URL}}', description: 'Direct link to student login portal' },
      { key: '{{PLATFORM_NAME}}', description: 'Institution or platform name' }
    ],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f1f5f9; margin: 0; padding: 0; }
    .wrapper { background-color: #f1f5f9; padding: 40px 20px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 36px 28px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
    .header p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 32px 28px; }
    .welcome-text { font-size: 16px; margin-bottom: 20px; color: #334155; }
    .credentials-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .credential-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
    .credential-row:last-child { border-bottom: none; }
    .credential-label { font-weight: 600; color: #64748b; }
    .credential-value { color: #0f172a; font-family: monospace; font-size: 14px; font-weight: 700; }
    .btn-wrap { text-align: center; margin: 32px 0 20px; }
    .btn { display: inline-block; padding: 14px 34px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; text-align: center; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .note { font-size: 13px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px; line-height: 1.5; }
    .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 28px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Welcome to {{PLATFORM_NAME}}</h1>
        <p>Your student journey begins now</p>
      </div>
      <div class="content">
        <p class="welcome-text">Hello <strong>{{NAME}}</strong>,</p>
        <p style="color: #475569; font-size: 15px;">Your student account has been created and you have been registered for <strong>{{COURSE_NAME}}</strong>.</p>
        
        <div class="credentials-box">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6366f1; margin-bottom: 12px;">Your Login Credentials</div>
          <div class="credential-row">
            <span class="credential-label">Username / Email:</span>
            <span class="credential-value">{{EMAIL}}</span>
          </div>
          <div class="credential-row">
            <span class="credential-label">Temporary Password:</span>
            <span class="credential-value">{{PASSWORD}}</span>
          </div>
          <div class="credential-row">
            <span class="credential-label">Enrolled Course:</span>
            <span class="credential-value" style="font-family: inherit;">{{COURSE_NAME}}</span>
          </div>
        </div>

        <div class="btn-wrap">
          <a href="{{LOGIN_URL}}" target="_blank" class="btn">Log In to Your Account &rarr;</a>
        </div>
        
        <p class="note">
          <strong>Security Tip:</strong> For your protection, we recommend logging in and changing your temporary password immediately from your profile settings.
        </p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; {{PLATFORM_NAME}} &bull; All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    code: 'course_completion',
    name: 'Course Completion & Certificate',
    category: 'lms',
    description: 'Sent when a student completes all required lessons and assessments for an enrolled course.',
    subject: 'Congratulations on Completing {{COURSE_NAME}}! 🎉',
    placeholders: [
      { key: '{{STUDENT_NAME}}', description: 'Student full name' },
      { key: '{{COURSE_NAME}}', description: 'Completed course title' },
      { key: '{{COMPLETION_DATE}}', description: 'Formatted completion date' },
      { key: '{{CERTIFICATE_TEXT}}', description: 'Certificate availability notice' },
      { key: '{{CERTIFICATE_BUTTON}}', description: 'Certificate download button HTML' },
      { key: '{{PROFILE_PICTURE_HTML}}', description: 'Student avatar or initials element' },
      { key: '{{FRONTEND_URL}}', description: 'Application base web URL' }
    ],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; line-height: 1.6; }
    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-align: center; padding: 40px 24px 30px; }
    .header h1 { margin: 8px 0 0; font-size: 26px; font-weight: 700; }
    .header p { margin: 6px 0 0; font-size: 15px; opacity: 0.9; }
    .content { padding: 36px 30px; color: #1e293b; }
    .course-details { background-color: #f8fafc; border-left: 4px solid #10b981; padding: 18px 20px; margin: 24px 0; border-radius: 8px; border: 1px solid #e2e8f0; border-left-width: 4px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; text-align: center; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .footer { background-color: #f8fafc; padding: 24px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
    .action-buttons { margin-top: 32px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      {{PROFILE_PICTURE_HTML}}
      <div style="font-size: 36px; margin-bottom: 6px;">🎉</div>
      <h1>Congratulations!</h1>
      <p>Course Completed Successfully</p>
    </div>
    <div class="content">
      <h2 style="margin: 0 0 16px; font-size: 20px; color: #0f172a;">Hi {{STUDENT_NAME}},</h2>
      <p style="color: #475569; font-size: 15px; margin-bottom: 20px;">
        You have successfully completed all the requirements for your course. This is a significant milestone, and we are thrilled to recognize your hard work and achievement!
      </p>
      
      <div class="course-details">
        <p style="margin: 0 0 8px; font-size: 15px;"><strong>Course:</strong> {{COURSE_NAME}}</p>
        <p style="margin: 0; font-size: 14px; color: #64748b;"><strong>Completed On:</strong> {{COMPLETION_DATE}}</p>
      </div>
      
      <p style="color: #475569; font-size: 14px;">{{CERTIFICATE_TEXT}}</p>
      
      <div class="action-buttons">
        {{CERTIFICATE_BUTTON}}
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0;">Academy &amp; Employment Management System &bull; Keep learning and leveling up!</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    code: 'password_reset',
    name: 'Password Reset Request',
    category: 'auth',
    description: 'Sent when a user requests to reset their forgotten password.',
    subject: 'Reset Your Password - Brixify',
    placeholders: [
      { key: '{{NAME}}', description: 'User full name (if known)' },
      { key: '{{RESET_LINK}}', description: 'Secure one-time link to set a new password' },
      { key: '{{EXPIRY_TIME}}', description: 'Token validity period (e.g., 1 hour)' },
      { key: '{{PLATFORM_NAME}}', description: 'Organization or platform name' }
    ],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
    .wrapper { background-color: #f1f5f9; padding: 40px 20px; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h2 { margin: 0; font-size: 22px; font-weight: 700; }
    .content { padding: 32px 28px; color: #1e293b; font-size: 15px; line-height: 1.6; }
    .btn-wrap { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; padding: 14px 34px; background: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; }
    .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h2>Reset Your Password</h2>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>We received a request to reset your password for your {{PLATFORM_NAME}} account.</p>
        <p>Click the button below to choose a new password:</p>
        
        <div class="btn-wrap">
          <a href="{{RESET_LINK}}" target="_blank" class="btn">Reset Password &rarr;</a>
        </div>
        
        <p style="font-size: 13px; color: #64748b;">
          If you did not make this request, you can safely ignore this email. Your current password will remain unchanged.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          This password reset link is valid for <strong>{{EXPIRY_TIME}}</strong>.
        </p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; {{PLATFORM_NAME}} &bull; Security &amp; Account Protection</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    code: 'event_otp',
    name: 'Event Registration OTP',
    category: 'events',
    description: 'Sent to attendees during public event registration to verify their email address with a 6-digit one-time code.',
    subject: 'Your Verification Code for {{EVENT_TITLE}}: {{OTP}}',
    placeholders: [
      { key: '{{NAME}}', description: 'Attendee name' },
      { key: '{{EVENT_TITLE}}', description: 'Event title' },
      { key: '{{OTP}}', description: '6-digit numeric verification passcode' },
      { key: '{{VALIDITY}}', description: 'Expiration duration (e.g. 10 minutes)' }
    ],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #eef2f6;">
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 36px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Verify Your Email</h1>
      <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 15px;">Event Registration Verification</p>
    </div>
    <div style="padding: 32px 30px;">
      <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
        Hello <strong>{{NAME}}</strong>,
      </p>
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
        Thank you for initiating registration for <strong>{{EVENT_TITLE}}</strong>. To complete your registration and confirm your seat, please enter the following verification code:
      </p>
      <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0;">
        <div style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your One-Time Code</div>
        <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: monospace;">{{OTP}}</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Valid for {{VALIDITY}}</div>
      </div>
      <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
        If you did not request this verification, you can safely ignore this email.
      </p>
    </div>
    <div style="background-color: #f8fafc; border-top: 1px solid #eef2f6; padding: 20px 30px; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        Sent via Brevo REST API &bull; Academy &amp; Employment Management System
      </p>
    </div>
  </div>
</body>
</html>`
  },
  {
    code: 'event_registration_success',
    name: 'Event Registration Confirmation',
    category: 'events',
    description: 'Sent immediately after an attendee completes registration for a live workshop, webinar, or event.',
    subject: 'Registration Confirmed: {{EVENT_TITLE}} 🎉',
    placeholders: [
      { key: '{{NAME}}', description: 'Attendee name' },
      { key: '{{EVENT_TITLE}}', description: 'Event title' },
      { key: '{{EVENT_DATE}}', description: 'Scheduled date and time' },
      { key: '{{ATTENDEE_TYPE}}', description: 'Attendee category (Working, Student, etc.)' },
      { key: '{{ORGANIZATION}}', description: 'College or Company name' },
      { key: '{{JOIN_LINK}}', description: 'Direct join / session URL' }
    ],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed - {{EVENT_TITLE}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="background-color: #f1f5f9; padding: 36px 16px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
      
      <!-- Top Brand Accent Bar -->
      <div style="height: 6px; background: linear-gradient(90deg, #10b981 0%, #059669 50%, #d97706 100%);"></div>

      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%); padding: 36px 30px; text-align: center; color: #ffffff;">
        <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px; color: #a7f3d0;">
          CONFIRMED REGISTRATION
        </div>
        <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.3px;">
          You're Registered! 🎉
        </h1>
        <p style="color: #d1fae5; margin: 0; font-size: 15px; font-weight: 400;">
          Your seat has been reserved successfully
        </p>
      </div>

      <!-- Main Content -->
      <div style="padding: 32px 28px;">
        <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 14px 0;">
          Hello <strong>{{NAME}}</strong>,
        </p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Congratulations! Your registration for <strong>{{EVENT_TITLE}}</strong> is confirmed. Below are your event access and participation details:
        </p>

        <!-- Highfield UK Certificate Card -->
        <div style="background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #f59e0b; border-radius: 14px; padding: 20px; margin: 0 0 24px 0; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.12);">
          <div style="font-size: 16px; font-weight: 800; color: #92400e; line-height: 1.4; margin-bottom: 10px;">
            🎓 Just 1 Hour | Get Your Highfield UK Certificate! 🎊🎊🎉🎉
          </div>
          <div style="background: #ffffff; border-left: 4px solid #d97706; border-radius: 8px; padding: 12px 14px; font-size: 13px; line-height: 1.6; color: #78350f;">
            <strong>• Highfield Certificate:</strong> Full attendance throughout the programme is mandatory to qualify for the certificate. Attendance will be monitored directly by Highfield.
          </div>
        </div>

        <!-- Event Details Card -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px; margin: 0 0 24px 0;">
          <h3 style="color: #0f172a; margin: 0 0 14px 0; font-size: 17px; font-weight: 700; line-height: 1.4; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
            {{EVENT_TITLE}}
          </h3>
          
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: #334155;">
            <tr>
              <td style="padding: 6px 0; vertical-align: top; width: 140px; font-weight: 600; color: #64748b;">
                📅 Date &amp; Time:
              </td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">
                {{EVENT_DATE}}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; vertical-align: top; font-weight: 600; color: #64748b;">
                👤 Attendee:
              </td>
              <td style="padding: 6px 0; color: #0f172a;">
                <strong>{{NAME}}</strong> ({{ATTENDEE_TYPE}})
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; vertical-align: top; font-weight: 600; color: #64748b;">
                🏢 Organization:
              </td>
              <td style="padding: 6px 0; color: #0f172a;">
                {{ORGANIZATION}}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; vertical-align: top; font-weight: 600; color: #64748b;">
                📍 Mode:
              </td>
              <td style="padding: 6px 0; color: #0f172a;">
                <span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 10px; border-radius: 6px; font-weight: 600; font-size: 12px;">
                  Online Live Session
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Join CTA Button -->
        <div style="text-align: center; margin: 26px 0;">
          <a href="{{JOIN_LINK}}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35); letter-spacing: 0.2px;">
            Join Event Link &rarr;
          </a>
        </div>

        <!-- Join Notice Box -->
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 6px; padding: 13px 16px; margin: 22px 0;">
          <p style="color: #065f46; margin: 0; font-size: 13px; line-height: 1.5;">
            <strong>Important:</strong> When the event start time arrives, the <strong>"Join Event"</strong> button will become active on the event page. You can click to enter the meeting room directly.
          </p>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
          🔔 <strong>Reminder notice:</strong> We will also email you an automated reminder with the direct join link <strong>24 hours before the event starts</strong>.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8fafc; border-top: 1px solid #eef2f6; padding: 22px 30px; text-align: center;">
        <p style="color: #64748b; font-size: 12px; margin: 0 0 6px 0;">
          Need assistance or have questions? Email us at <a href="mailto:support@brixify.online" style="color: #059669; text-decoration: none; font-weight: 600;">support@brixify.online</a>
        </p>
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          Academy &amp; Employment Management System &bull; Brix
        </p>
      </div>

    </div>
  </div>
</body>
</html>`
  },
  {
    code: 'event_reminder',
    name: 'Event 24-Hour Reminder',
    category: 'events',
    description: 'Scheduled automated reminder sent 24 hours prior to a live event start with direct meeting room credentials.',
    subject: 'Reminder: {{EVENT_TITLE}} is Starting Tomorrow! 🚀',
    placeholders: [
      { key: '{{NAME}}', description: 'Attendee name' },
      { key: '{{EVENT_TITLE}}', description: 'Event title' },
      { key: '{{EVENT_DATE}}', description: 'Scheduled event time and date' },
      { key: '{{JOIN_LINK}}', description: 'Direct meeting link' },
      { key: '{{ATTENDEE_DETAIL}}', description: 'Attendee organization and occupation' }
    ],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Starting in 24 Hours</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #eef2f6;">
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 36px 30px; text-align: center;">
      <div style="font-size: 40px; margin-bottom: 8px;">⏰</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Starting in 24 Hours!</h1>
      <p style="color: #fef3c7; margin: 8px 0 0 0; font-size: 15px;">Get ready for your upcoming session</p>
    </div>
    <div style="padding: 32px 30px;">
      <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
        Hello <strong>{{NAME}}</strong>,
      </p>
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
        This is a friendly reminder that <strong>{{EVENT_TITLE}}</strong> is scheduled to begin in 24 hours. Here are the key details to make sure you have a seamless experience:
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; margin: 24px 0;">
        <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 18px;">{{EVENT_TITLE}}</h3>
        <div style="margin-bottom: 8px; color: #475569; font-size: 14px;">
          <strong>📅 Scheduled Time:</strong> {{EVENT_DATE}}
        </div>
        <div style="color: #475569; font-size: 14px;">
          <strong>👤 Registered as:</strong> {{ATTENDEE_DETAIL}}
        </div>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{JOIN_LINK}}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
          Join Event Link &rarr;
        </a>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
        Tip: We recommend joining 5 minutes early to test your audio and video setup.
      </p>
    </div>
    <div style="background-color: #f8fafc; border-top: 1px solid #eef2f6; padding: 20px 30px; text-align: center;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">
        Sent via Brevo REST API &bull; Academy &amp; Employment Management System
      </p>
    </div>
  </div>
</body>
</html>`
  },
  {
    code: 'placement_selection',
    name: 'Job Placement Congratulations',
    category: 'jobs',
    description: 'Sent when an employer selects a student for a job opening or internship role.',
    subject: 'Congratulations! You Have Been Selected for {{JOB_TITLE}}',
    placeholders: [
      { key: '{{NAME}}', description: 'Student full name' },
      { key: '{{JOB_TITLE}}', description: 'Selected job title' },
      { key: '{{COMPANY_NAME}}', description: 'Hiring company name' },
      { key: '{{PORTAL_URL}}', description: 'Student placements dashboard URL' }
    ],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 36px 24px; text-align: center; }
    .content { padding: 32px 28px; color: #1e293b; font-size: 15px; line-height: 1.6; }
    .highlight-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .btn { display: inline-block; padding: 14px 32px; background: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 36px; margin-bottom: 6px;">🎉</div>
      <h2 style="margin: 0; font-size: 24px;">Congratulations! You Have Been Selected</h2>
    </div>
    <div class="content">
      <p>Dear <strong>{{NAME}}</strong>,</p>
      <p>We are thrilled to inform you that you have been selected for the position of <strong>{{JOB_TITLE}}</strong> at <strong>{{COMPANY_NAME}}</strong>.</p>
      
      <div class="highlight-card">
        <div style="font-size: 13px; color: #64748b; font-weight: 600;">Position:</div>
        <div style="font-size: 18px; font-weight: 700; color: #4f46e5; margin-bottom: 8px;">{{JOB_TITLE}}</div>
        <div style="font-size: 13px; color: #64748b; font-weight: 600;">Employer:</div>
        <div style="font-size: 16px; font-weight: 600; color: #1e293b;">{{COMPANY_NAME}}</div>
      </div>

      <p>Your hard work and dedication have paid off. The employer will be contacting you shortly with the official offer letter and onboarding schedule.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{PORTAL_URL}}" target="_blank" class="btn">View Placement Details &rarr;</a>
      </div>
      <p style="font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-bottom: 0;">
        Brixify Placement Cell &bull; Career Development Team
      </p>
    </div>
  </div>
</body>
</html>`
  },
  {
    code: 'tutor_approved',
    name: 'Tutor Application Approved',
    category: 'users',
    description: 'Sent when an administrator approves a tutor registration request.',
    subject: '🎉 Your Tutor Application has been Approved — Brixify',
    placeholders: [
      { key: '{{NAME}}', description: 'Tutor name' },
      { key: '{{ADMIN_NOTES}}', description: 'Optional admin review feedback or note' },
      { key: '{{DASHBOARD_URL}}', description: 'Tutor dashboard URL' }
    ],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px 24px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Application Approved! 🎉</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Welcome to our teaching faculty</p>
    </div>
    <div style="padding: 32px 28px;">
      <p style="font-size: 16px;">Dear <strong>{{NAME}}</strong>,</p>
      <p>We are thrilled to inform you that your tutor application has been <strong style="color: #10b981;">approved</strong>!</p>
      <p>You now have full access to:</p>
      <ul style="line-height: 2; color: #475569;">
        <li>📚 Course Creation &amp; Curriculum Builder</li>
        <li>👥 Student Management &amp; Assignment Grading</li>
        <li>📊 Revenue &amp; Analytics Studio</li>
      </ul>
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{DASHBOARD_URL}}" style="display: inline-block; padding: 14px 32px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">Go to Tutor Dashboard &rarr;</a>
      </div>
      <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">Welcome aboard, and we look forward to your contributions to our learners!</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    code: 'tutor_rejected',
    name: 'Tutor Application Update',
    category: 'users',
    description: 'Sent when an administrator rejects or requests changes for a tutor application.',
    subject: 'Update on Your Tutor Application — Brixify',
    placeholders: [
      { key: '{{NAME}}', description: 'Tutor full name' },
      { key: '{{REASON}}', description: 'Feedback or explanation from reviewer' },
      { key: '{{SUPPORT_EMAIL}}', description: 'Support email address' }
    ],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #64748b, #475569); padding: 32px 24px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 24px;">Application Update</h1>
    </div>
    <div style="padding: 32px 28px;">
      <p style="font-size: 16px;">Dear <strong>{{NAME}}</strong>,</p>
      <p>Thank you for your interest in joining as an instructor. After careful review, we are unable to approve your application at this time.</p>
      <div style="background: #f8fafc; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 6px;">
        <strong>Reviewer Feedback:</strong>
        <p style="margin: 6px 0 0 0; color: #475569;">{{REASON}}</p>
      </div>
      <p style="font-size: 14px; color: #64748b;">If you believe this is a misunderstanding or have updated qualifications, please contact our support desk at <a href="mailto:{{SUPPORT_EMAIL}}">{{SUPPORT_EMAIL}}</a>.</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    code: 'system_user_welcome',
    name: 'System Staff Account Created',
    category: 'users',
    description: 'Sent to newly created administrators, coordinators, or support staff with their temporary login credentials.',
    subject: 'Your System Account has been created — Brixify',
    placeholders: [
      { key: '{{NAME}}', description: 'Staff user name' },
      { key: '{{ROLE}}', description: 'Assigned system role' },
      { key: '{{TEMPORARY_PASSWORD}}', description: 'Generated temporary password' },
      { key: '{{LOGIN_URL}}', description: 'Staff portal sign-in URL' }
    ],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; padding: 20px; color: #1e293b;">
  <div style="max-width: 540px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 28px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
    <h2 style="color: #4f46e5; margin-top: 0;">Welcome to the Team, {{NAME}}!</h2>
    <p>Your administrative account has been created with the assigned role: <strong style="color: #4f46e5;">{{ROLE}}</strong>.</p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <div style="font-size: 13px; color: #64748b;">Temporary Password:</div>
      <div style="font-family: monospace; font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px;">{{TEMPORARY_PASSWORD}}</div>
    </div>
    <p>Please log in and change your password immediately:</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{LOGIN_URL}}" style="display: inline-block; padding: 12px 28px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Log In to Staff Portal &rarr;</a>
    </div>
  </div>
</body>
</html>`
  },
  {
    code: 'job_approved',
    name: 'Job Listing Approved',
    category: 'jobs',
    description: 'Sent to employers when their submitted job vacancy is approved by the placement cell and published live.',
    subject: '✅ Your Job Listing is Live: {{JOB_TITLE}}',
    placeholders: [
      { key: '{{NAME}}', description: 'Employer contact person' },
      { key: '{{JOB_TITLE}}', description: 'Approved job post title' },
      { key: '{{PORTAL_URL}}', description: 'Employer jobs dashboard link' }
    ],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 560px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 28px;">
    <h2 style="color: #10b981; margin-top: 0;">Job Listing Approved!</h2>
    <p>Hello <strong>{{NAME}}</strong>,</p>
    <p>Your job listing for <strong>{{JOB_TITLE}}</strong> has been reviewed, approved, and is now live on our placement board.</p>
    <p>Qualified candidates will begin viewing and applying for this role. You can review applicants in real-time from your portal.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{PORTAL_URL}}" style="display: inline-block; padding: 12px 28px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">View Applications &rarr;</a>
    </div>
  </div>
</body>
</html>`
  },
  {
    code: 'job_rejected',
    name: 'Job Listing Revision Required',
    category: 'jobs',
    description: 'Sent to employers when a job listing submission requires edits or cannot be approved.',
    subject: '❌ Your Job Listing requires revisions: {{JOB_TITLE}}',
    placeholders: [
      { key: '{{NAME}}', description: 'Employer contact person' },
      { key: '{{JOB_TITLE}}', description: 'Job post title' },
      { key: '{{REASON}}', description: 'Moderator notes or reason for revision request' },
      { key: '{{PORTAL_URL}}', description: 'Link to edit job draft' }
    ],
    body_html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 20px; color: #1e293b;">
  <div style="max-width: 560px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 28px;">
    <h2 style="color: #ef4444; margin-top: 0;">Job Listing Revisions Required</h2>
    <p>Hello <strong>{{NAME}}</strong>,</p>
    <p>Your job listing for <strong>{{JOB_TITLE}}</strong> could not be approved in its current form.</p>
    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; margin: 20px 0; border-radius: 6px;">
      <strong>Reason for Revision:</strong>
      <p style="margin: 6px 0 0 0; color: #991b1b;">{{REASON}}</p>
    </div>
    <p>Please update your draft according to the feedback above and resubmit for moderation.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{PORTAL_URL}}" style="display: inline-block; padding: 12px 28px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Edit &amp; Resubmit Job &rarr;</a>
    </div>
  </div>
</body>
</html>`
  }
];

class EmailTemplateService {
  constructor() {
    this.tableInitialized = false;
  }

  /**
   * Ensure database table exists and seed default templates if missing
   */
  async initTable() {
    if (this.tableInitialized) return;
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS email_templates (
          id CHAR(36) PRIMARY KEY,
          code VARCHAR(64) UNIQUE NOT NULL,
          name VARCHAR(150) NOT NULL,
          description TEXT,
          category VARCHAR(50) NOT NULL DEFAULT 'general',
          subject VARCHAR(255) NOT NULL,
          body_html MEDIUMTEXT NOT NULL,
          placeholders_json JSON,
          is_system BOOLEAN DEFAULT TRUE,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email_templates_category (category),
          INDEX idx_email_templates_active (is_active)
        )
      `);

      // Seed missing default templates
      for (const tpl of DEFAULT_EMAIL_TEMPLATES) {
        const [existing] = await pool.query('SELECT id, body_html FROM email_templates WHERE code = ?', [tpl.code]);
        if (!existing || existing.length === 0) {
          const id = uuidv4();
          await pool.query(`
            INSERT INTO email_templates (id, code, name, description, category, subject, body_html, placeholders_json, is_system, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
          `, [
            id,
            tpl.code,
            tpl.name,
            tpl.description,
            tpl.category,
            tpl.subject,
            tpl.body_html,
            JSON.stringify(tpl.placeholders)
          ]);
        } else if (tpl.code === 'event_registration_success' && existing[0].body_html && !existing[0].body_html.includes('Highfield')) {
          await pool.query(`
            UPDATE email_templates
            SET body_html = ?, subject = ?, placeholders_json = ?
            WHERE code = ?
          `, [
            tpl.body_html,
            tpl.subject,
            JSON.stringify(tpl.placeholders),
            tpl.code
          ]);
        }
      }

      this.tableInitialized = true;
    } catch (e) {
      console.warn('EmailTemplateService: initTable warning:', e.message);
    }
  }

  /**
   * Get all templates with optional filtering
   */
  async getAllTemplates({ category = '', search = '', activeOnly = false } = {}) {
    await this.initTable();
    try {
      let sql = 'SELECT * FROM email_templates WHERE 1=1';
      const params = [];

      if (category && category !== 'all') {
        sql += ' AND category = ?';
        params.push(category);
      }

      if (activeOnly) {
        sql += ' AND is_active = 1';
      }

      if (search && search.trim() !== '') {
        sql += ' AND (name LIKE ? OR subject LIKE ? OR code LIKE ? OR description LIKE ?)';
        const term = `%${search.trim()}%`;
        params.push(term, term, term, term);
      }

      sql += ' ORDER BY category ASC, name ASC';

      const [rows] = await pool.query(sql, params);
      return rows.map(r => ({
        ...r,
        is_active: !!r.is_active,
        is_system: !!r.is_system,
        placeholders: typeof r.placeholders_json === 'string' ? JSON.parse(r.placeholders_json || '[]') : (r.placeholders_json || [])
      }));
    } catch (e) {
      console.error('EmailTemplateService.getAllTemplates error:', e);
      // Fallback to static defaults
      return DEFAULT_EMAIL_TEMPLATES.map(t => ({
        id: `default-${t.code}`,
        ...t,
        is_system: true,
        is_active: true
      }));
    }
  }

  /**
   * Get single template by ID
   */
  async getTemplateById(id) {
    await this.initTable();
    const [rows] = await pool.query('SELECT * FROM email_templates WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    return {
      ...r,
      is_active: !!r.is_active,
      is_system: !!r.is_system,
      placeholders: typeof r.placeholders_json === 'string' ? JSON.parse(r.placeholders_json || '[]') : (r.placeholders_json || [])
    };
  }

  /**
   * Get single template by Code
   */
  async getTemplateByCode(code) {
    await this.initTable();
    try {
      const [rows] = await pool.query('SELECT * FROM email_templates WHERE code = ? AND is_active = 1', [code]);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          ...r,
          is_active: !!r.is_active,
          is_system: !!r.is_system,
          placeholders: typeof r.placeholders_json === 'string' ? JSON.parse(r.placeholders_json || '[]') : (r.placeholders_json || [])
        };
      }
    } catch (e) {
      console.warn(`EmailTemplateService.getTemplateByCode(${code}) DB error:`, e.message);
    }

    // Fallback to default in-memory definition
    const def = DEFAULT_EMAIL_TEMPLATES.find(t => t.code === code);
    if (def) {
      return {
        id: `default-${def.code}`,
        ...def,
        is_system: true,
        is_active: true
      };
    }
    return null;
  }

  /**
   * Create a new custom template
   */
  async createTemplate({ code, name, description, category, subject, body_html, placeholders = [] }) {
    await this.initTable();
    const id = uuidv4();
    const cleanCode = (code || name || 'custom')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^_+|_+$/g, '');

    await pool.query(`
      INSERT INTO email_templates (id, code, name, description, category, subject, body_html, placeholders_json, is_system, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
    `, [
      id,
      cleanCode,
      name,
      description || '',
      category || 'general',
      subject,
      body_html,
      JSON.stringify(placeholders)
    ]);

    return this.getTemplateById(id);
  }

  /**
   * Update an existing template
   */
  async updateTemplate(id, { name, description, category, subject, body_html, placeholders, is_active }) {
    await this.initTable();
    const existing = await this.getTemplateById(id);
    if (!existing) throw new Error('Template not found');

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (subject !== undefined) { updates.push('subject = ?'); params.push(subject); }
    if (body_html !== undefined) { updates.push('body_html = ?'); params.push(body_html); }
    if (placeholders !== undefined) { updates.push('placeholders_json = ?'); params.push(JSON.stringify(placeholders)); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE email_templates SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    return this.getTemplateById(id);
  }

  /**
   * Delete a custom template
   */
  async deleteTemplate(id) {
    await this.initTable();
    const existing = await this.getTemplateById(id);
    if (!existing) throw new Error('Template not found');
    if (existing.is_system) {
      throw new Error('System templates cannot be deleted. You can deactivate them instead.');
    }
    await pool.query('DELETE FROM email_templates WHERE id = ?', [id]);
    return { success: true };
  }

  /**
   * Reset a system template to factory defaults
   */
  async resetTemplate(id) {
    await this.initTable();
    const existing = await this.getTemplateById(id);
    if (!existing) throw new Error('Template not found');

    const defaultTpl = DEFAULT_EMAIL_TEMPLATES.find(t => t.code === existing.code);
    if (!defaultTpl) {
      throw new Error('No default definition found for this template code.');
    }

    await pool.query(`
      UPDATE email_templates
      SET subject = ?, body_html = ?, placeholders_json = ?, name = ?, description = ?, category = ?, is_active = 1
      WHERE id = ?
    `, [
      defaultTpl.subject,
      defaultTpl.body_html,
      JSON.stringify(defaultTpl.placeholders),
      defaultTpl.name,
      defaultTpl.description,
      defaultTpl.category,
      id
    ]);

    return this.getTemplateById(id);
  }

  /**
   * Render template by replacing placeholders with supplied variable values
   */
  render(templateStr, variables = {}) {
    if (!templateStr) return '';
    let result = templateStr;
    for (const [key, val] of Object.entries(variables)) {
      const cleanKey = key.startsWith('{{') ? key : `{{${key}}}`;
      const safeVal = val === null || val === undefined ? '' : String(val);
      result = result.split(cleanKey).join(safeVal);
    }
    return result;
  }

  /**
   * Generate preview data with sample mock values
   */
  getSampleVariables(code = '', placeholders = []) {
    const sample = {
      '{{NAME}}': 'Ameer',
      '{{STUDENT_NAME}}': 'Alex Johnson',
      '{{EMAIL}}': 'ameer@brixify.online',
      '{{PASSWORD}}': 'Brixify@2026!',
      '{{COURSE_NAME}}': 'Full-Stack Web Development Masterclass',
      '{{LOGIN_URL}}': `${process.env.FRONTEND_URL || 'https://brixify.online'}/login`,
      '{{PLATFORM_NAME}}': 'Brix Certifications',
      '{{COMPLETION_DATE}}': new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      '{{CERTIFICATE_TEXT}}': 'Your verified certificate of completion is now available for download.',
      '{{CERTIFICATE_BUTTON}}': `<a href="${process.env.FRONTEND_URL || 'https://brixify.online'}/dashboard/certificates" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">Download Certificate &rarr;</a>`,
      '{{PROFILE_PICTURE_HTML}}': `<div style="width:72px;height:72px;border-radius:50%;background:#4f46e5;color:#ffffff;font-size:28px;font-weight:bold;line-height:72px;text-align:center;margin:0 auto 16px;">AJ</div>`,
      '{{FRONTEND_URL}}': process.env.FRONTEND_URL || 'https://brixify.online',
      '{{RESET_LINK}}': `${process.env.FRONTEND_URL || 'https://brixify.online'}/reset-password?token=sample-reset-token-xyz123`,
      '{{EXPIRY_TIME}}': '1 hour',
      '{{EVENT_TITLE}}': 'Highfield International - World Food Day Webinar',
      '{{OTP}}': '739241',
      '{{VALIDITY}}': '10 minutes',
      '{{EVENT_DATE}}': 'Sunday, October 25, 2026 at 07:30 PM IST',
      '{{ATTENDEE_TYPE}}': 'Working',
      '{{ATTENDEE_DETAIL}}': 'Working (Company: Brix)',
      '{{ORGANIZATION}}': 'Company: Brix',
      '{{JOIN_LINK}}': `${process.env.FRONTEND_URL || 'https://brixify.online'}/events/world-food-day`,
      '{{JOB_TITLE}}': 'Senior Full Stack Engineer',
      '{{COMPANY_NAME}}': 'Apex Global Technologies',
      '{{PORTAL_URL}}': `${process.env.FRONTEND_URL || 'https://brixify.online'}/dashboard/jobs`,
      '{{ADMIN_NOTES}}': 'Great profile credentials! Looking forward to your advanced course syllabus.',
      '{{DASHBOARD_URL}}': `${process.env.FRONTEND_URL || 'https://brixify.online'}/dashboard/tutor`,
      '{{REASON}}': 'Application requires updated industry certification portfolio.',
      '{{SUPPORT_EMAIL}}': 'support@brixify.online',
      '{{ROLE}}': 'Placement Coordinator',
      '{{TEMPORARY_PASSWORD}}': 'StaffBrix#2026'
    };

    if (code === 'course_enrollment' || code === 'certificate_issued') {
      sample['{{NAME}}'] = 'Alex Johnson';
    }

    if (Array.isArray(placeholders)) {
      for (const p of placeholders) {
        if (!sample[p.key]) {
          sample[p.key] = `[${p.description || p.key}]`;
        }
      }
    }
    return sample;
  }

  /**
   * Preview a template by code or raw content
   */
  async previewTemplate({ id, code, subject, body_html, variables = {} }) {
    let tplSubject = subject;
    let tplBody = body_html;
    let tplCode = code;
    let placeholders = [];

    if (id) {
      const dbTpl = await this.getTemplateById(id);
      if (dbTpl) {
        tplSubject = tplSubject || dbTpl.subject;
        tplBody = tplBody || dbTpl.body_html;
        tplCode = tplCode || dbTpl.code;
        placeholders = dbTpl.placeholders || [];
      }
    } else if (code) {
      const dbTpl = await this.getTemplateByCode(code);
      if (dbTpl) {
        tplSubject = tplSubject || dbTpl.subject;
        tplBody = tplBody || dbTpl.body_html;
        placeholders = dbTpl.placeholders || [];
      }
    }

    const defaultVars = this.getSampleVariables(tplCode, placeholders);
    const mergedVars = { ...defaultVars, ...variables };

    return {
      rendered_subject: this.render(tplSubject, mergedVars),
      rendered_html: this.render(tplBody, mergedVars),
      variables_used: mergedVars
    };
  }

  /**
   * Send a test email for this template
   */
  async sendTestEmail({ id, code, subject, body_html, recipient, variables = {} }) {
    const preview = await this.previewTemplate({ id, code, subject, body_html, variables });
    const targetEmail = recipient || 'admin@brixify.online';

    const testSubject = `[TEST] ${preview.rendered_subject}`;
    return emailService.sendEmail({
      to: targetEmail,
      subject: testSubject,
      html: preview.rendered_html
    });
  }

  /**
   * Dispatch a templated email. Uses DB template if active; otherwise uses fallback.
   */
  async sendTemplatedEmail({ code, to, variables = {}, fallbackSubject = '', fallbackHtml = '', sender = null }) {
    try {
      const template = await this.getTemplateByCode(code);
      if (template && template.is_active && template.body_html) {
        const subject = this.render(template.subject, variables);
        const html = this.render(template.body_html, variables);
        return emailService.sendEmail({ to, subject, html, sender });
      }
    } catch (e) {
      console.warn(`EmailTemplateService: Failed to dispatch using DB template [${code}]:`, e.message);
    }

    // Graceful fallback to legacy hardcoded template
    const subject = this.render(fallbackSubject, variables);
    const html = this.render(fallbackHtml, variables);
    return emailService.sendEmail({ to, subject, html, sender });
  }
}

export default new EmailTemplateService();
