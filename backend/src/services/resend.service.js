import { ConfigService } from './config.service.js';

class ResendEmailService {
  constructor() {
    this.apiKey = null;
    this.fromEmail = null;
    this.fromName = null;
  }

  async loadConfig() {
    let apiKey = process.env.RESEND_API_KEY || process.env.BREVO_API_KEY;
    let fromEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || process.env.BREVO_FROM_EMAIL || process.env.SMTP_FROM || 'events@aems.local';
    let fromName = process.env.RESEND_FROM_NAME || process.env.BREVO_FROM_NAME || 'AEMS Events';

    try {
      if (!apiKey) {
        const dbKey = (await ConfigService.getByKey('resend_api_key', false)) ||
                      (await ConfigService.getByKey('brevo_api_key', false)) ||
                      (await ConfigService.getByKey('smtp_pass', false));
        if (dbKey && dbKey.value && !dbKey.value.includes('...')) {
          apiKey = dbKey.value;
        }
      }

      const dbFrom = (await ConfigService.getByKey('resend_from_email')) ||
                     (await ConfigService.getByKey('brevo_from_email')) ||
                     (await ConfigService.getByKey('smtp_from_email'));
      if (dbFrom && dbFrom.value) {
        fromEmail = dbFrom.value;
      }

      const dbName = (await ConfigService.getByKey('resend_from_name')) ||
                     (await ConfigService.getByKey('brevo_from_name')) ||
                     (await ConfigService.getByKey('smtp_from_name'));
      if (dbName && dbName.value) {
        fromName = dbName.value;
      }
    } catch (e) {
      console.warn('ResendService: Could not query system_config table for Resend settings:', e.message);
    }

    this.apiKey = apiKey || null;
    this.fromEmail = fromEmail;
    this.fromName = fromName;

    return { apiKey: this.apiKey, fromEmail: this.fromEmail, fromName: this.fromName };
  }

  formatSender(sender) {
    if (typeof sender === 'string') {
      return sender;
    }
    const email = sender?.email || this.fromEmail || 'events@aems.local';
    const name = sender?.name || this.fromName || 'AEMS Events';
    if (email.includes('<') && email.includes('>')) {
      return email;
    }
    return name ? `${name} <${email}>` : email;
  }

  async sendEmail({ to, subject, htmlContent, html, text, sender }) {
    await this.loadConfig();

    const recipientList = Array.isArray(to)
      ? to.map(r => (typeof r === 'string' ? r : r.email))
      : [typeof to === 'string' ? to : to.email];

    const formattedFrom = this.formatSender(sender);
    const contentHtml = htmlContent || html || '';

    // If no real API key is set, log to console in dev mode
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.log('\n========================================');
      console.log('📨 [RESEND REST API - SIMULATED SEND]');
      console.log('To:', recipientList.join(', '));
      console.log('Subject:', subject);
      console.log('From:', formattedFrom);
      console.log('Note: To send real emails, set RESEND_API_KEY in .env or System Settings.');
      console.log('========================================\n');
      return { messageId: `mock-resend-${Date.now()}`, id: `mock-resend-${Date.now()}`, simulated: true, success: true };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: formattedFrom,
          to: recipientList,
          subject,
          html: contentHtml,
          ...(text ? { text } : {})
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Resend REST API Error:', data);
        return { success: false, error: data.message || 'Resend API call failed', details: data };
      }

      console.log('Email sent successfully via Resend REST API. Message ID:', data.id);
      return { success: true, messageId: data.id, id: data.id };
    } catch (error) {
      console.error('Failed to dispatch email via Resend REST API:', error.message || error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send 6-digit OTP email for registration verification
   */
  async sendEventOtpEmail({ email, name, otp, eventTitle }) {
    const displayName = name || 'Learner';

    try {
      const emailTemplateService = (await import('./email-template.service.js')).default;
      const template = await emailTemplateService.getTemplateByCode('event_otp');
      if (template && template.is_active && template.body_html) {
        const vars = {
          '{{NAME}}': displayName,
          '{{EVENT_TITLE}}': eventTitle,
          '{{OTP}}': otp,
          '{{VALIDITY}}': '10 minutes'
        };
        const subject = emailTemplateService.render(template.subject, vars);
        const htmlContent = emailTemplateService.render(template.body_html, vars);
        return this.sendEmail({
          to: { email, name: displayName },
          subject,
          htmlContent
        });
      }
    } catch (e) {
      console.warn('ResendService: template lookup failed for event_otp, using fallback:', e.message);
    }

    const subject = `Your Verification Code for ${eventTitle}: ${otp}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #eef2f6;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 36px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Verify Your Email</h1>
            <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 15px;">Event Registration Verification</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 30px;">
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
              Hello <strong>${displayName}</strong>,
            </p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              Thank you for initiating registration for <strong>${eventTitle}</strong>. To complete your registration and confirm your seat, please enter the following verification code:
            </p>

            <!-- OTP Box -->
            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0;">
              <div style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your One-Time Code</div>
              <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: monospace;">${otp}</div>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Valid for 10 minutes</div>
            </div>

            <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
              If you did not request this verification, you can safely ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #eef2f6; padding: 20px 30px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Sent via Resend REST API &bull; Academy &amp; Employment Management System
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: { email, name: displayName },
      subject,
      htmlContent
    });
  }

  /**
   * Send Registration Confirmation Email
   */
  async sendEventRegistrationSuccessEmail({ registration, event }) {
    const cleanDate = typeof event.event_start === 'string' ? event.event_start.replace('Z', '').replace(' ', 'T') : event.event_start;
    const eventDateFormatted = `${new Date(cleanDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })} IST`;

    const categoryDetail = registration.occupation === 'Student'
      ? `College: ${registration.organization}`
      : registration.occupation === 'Working'
      ? `Company: ${registration.organization}`
      : `Institution: ${registration.organization}`;

    const joinLink = event.meet_link || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events`;

    try {
      const emailTemplateService = (await import('./email-template.service.js')).default;
      const template = await emailTemplateService.getTemplateByCode('event_registration_success');
      if (template && template.is_active && template.body_html) {
        const vars = {
          '{{NAME}}': registration.name,
          '{{EVENT_TITLE}}': event.title,
          '{{EVENT_DATE}}': eventDateFormatted,
          '{{ATTENDEE_TYPE}}': registration.occupation,
          '{{ORGANIZATION}}': categoryDetail,
          '{{JOIN_LINK}}': joinLink
        };
        const subject = emailTemplateService.render(template.subject, vars);
        const htmlContent = emailTemplateService.render(template.body_html, vars);
        return this.sendEmail({
          to: { email: registration.email, name: registration.name },
          subject,
          htmlContent
        });
      }
    } catch (e) {
      console.warn('ResendService: template lookup failed for event_registration_success, using fallback:', e.message);
    }

    const subject = `Registration Confirmed: ${event.title} 🎉`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmed - ${event.title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <div style="background-color: #f1f5f9; padding: 36px 16px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
            
            <!-- Top Brand Accent Bar -->
            <div style="height: 6px; background: linear-gradient(90deg, #10b981 0%, #059669 50%, #d97706 100%);"></div>

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%); padding: 36px 30px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px; color: #a7f3d0;">
                Confirmed Seat
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Registration Successful!</h1>
              <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.9;">We look forward to seeing you at the event</p>
            </div>

            <!-- Body Content -->
            <div style="padding: 36px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #1e293b; margin: 0 0 18px 0;">
                Dear <strong>${registration.name}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Your registration for <strong>${event.title}</strong> has been successfully confirmed. Below are your event access and participation details:
              </p>

              <!-- Event Details Card -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; margin: 24px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; width: 140px; font-weight: 600;">Event Title:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 700;">${event.title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Date &amp; Time:</td>
                    <td style="padding: 8px 0; color: #047857; font-weight: 700;">${eventDateFormatted}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Occupation:</td>
                    <td style="padding: 8px 0; color: #1e293b;">${registration.occupation}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Organization:</td>
                    <td style="padding: 8px 0; color: #1e293b;">${registration.organization}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Registered Email:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-family: monospace;">${registration.email}</td>
                  </tr>
                </table>
              </div>

              <!-- Join CTA -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${joinLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);">
                  Access Event Room &rarr;
                </a>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #94a3b8;">
                  Save this email or bookmark the link above for event day
                </p>
              </div>

              <!-- Certificate / Attendance Reminder -->
              <div style="background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #f59e0b; border-radius: 14px; padding: 20px; margin: 0 0 24px 0;">
                <div style="font-weight: 800; font-size: 15px; color: #92400e; margin-bottom: 8px;">
                  🎓 Participation Certificate Information
                </div>
                <div style="background: #ffffff; border-left: 4px solid #d97706; border-radius: 8px; padding: 12px 14px; font-size: 13px; line-height: 1.6; color: #78350f;">
                  <strong>Important:</strong> Verifiable digital certificates of participation are awarded to attendees who actively participate in the live event.
                </div>
              </div>

              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                Need assistance? Feel free to reply directly to this email.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; border-top: 1px solid #eef2f6; padding: 24px 30px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 6px 0;">
                Sent via Resend REST API &bull; Academy &amp; Employment Management System
              </p>
            </div>

          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: { email: registration.email, name: registration.name },
      subject,
      htmlContent
    });
  }

  /**
   * Send 24-Hour Event Reminder Email
   */
  async sendEventReminderEmail({ registration, event }) {
    const cleanDate = typeof event.event_start === 'string' ? event.event_start.replace('Z', '').replace(' ', 'T') : event.event_start;
    const eventDateFormatted = `${new Date(cleanDate).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })} IST`;

    const joinLink = event.meet_link || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events`;

    try {
      const emailTemplateService = (await import('./email-template.service.js')).default;
      const template = await emailTemplateService.getTemplateByCode('event_reminder');
      if (template && template.is_active && template.body_html) {
        const vars = {
          '{{NAME}}': registration.name,
          '{{EVENT_TITLE}}': event.title,
          '{{EVENT_DATE}}': eventDateFormatted,
          '{{JOIN_LINK}}': joinLink
        };
        const subject = emailTemplateService.render(template.subject, vars);
        const htmlContent = emailTemplateService.render(template.body_html, vars);
        return this.sendEmail({
          to: { email: registration.email, name: registration.name },
          subject,
          htmlContent
        });
      }
    } catch (e) {
      console.warn('ResendService: template lookup failed for event_reminder, using fallback:', e.message);
    }

    const subject = `Reminder: ${event.title} is Starting Tomorrow! 🚀`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Starting in 24 Hours</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #eef2f6;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 36px 30px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 8px;">⏰</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Starting in 24 Hours!</h1>
            <p style="color: #fef3c7; margin: 8px 0 0 0; font-size: 15px;">Get ready for your upcoming session</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 30px;">
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
              Hello <strong>${registration.name}</strong>,
            </p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              This is a friendly reminder that <strong>${event.title}</strong> is scheduled to begin in 24 hours. Here are the key details to make sure you have a seamless experience:
            </p>

            <!-- Event Card -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; margin: 24px 0;">
              <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 18px;">${event.title}</h3>
              <div style="margin-bottom: 8px; color: #475569; font-size: 14px;">
                <strong>📅 Scheduled Time:</strong> ${eventDateFormatted}
              </div>
              <div style="color: #475569; font-size: 14px;">
                <strong>👤 Registered as:</strong> ${registration.occupation} (${registration.organization})
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${joinLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                Join Event Link &rarr;
              </a>
            </div>

            <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
              Tip: We recommend joining 5 minutes early to test your audio and video setup.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #eef2f6; padding: 20px 30px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Sent via Resend REST API &bull; Academy &amp; Employment Management System
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: { email: registration.email, name: registration.name },
      subject,
      htmlContent
    });
  }
}

export default new ResendEmailService();

