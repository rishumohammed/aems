import { ConfigService } from './config.service.js';

class BrevoEmailService {
  constructor() {
    this.apiKey = null;
    this.fromEmail = null;
    this.fromName = null;
  }

  async loadConfig() {
    let apiKey = process.env.BREVO_API_KEY;
    let fromEmail = process.env.BREVO_FROM_EMAIL || process.env.SMTP_FROM || 'events@aems.local';
    let fromName = process.env.BREVO_FROM_NAME || 'AEMS Events';

    try {
      if (!apiKey) {
        const dbKey = (await ConfigService.getByKey('brevo_api_key', false)) || (await ConfigService.getByKey('smtp_pass', false));
        if (dbKey && dbKey.value && !dbKey.value.includes('...')) {
          apiKey = dbKey.value;
        }
      }

      const dbFrom = (await ConfigService.getByKey('brevo_from_email')) || (await ConfigService.getByKey('smtp_from_email'));
      if (dbFrom && dbFrom.value) {
        fromEmail = dbFrom.value;
      }

      const dbName = (await ConfigService.getByKey('brevo_from_name')) || (await ConfigService.getByKey('smtp_from_name'));
      if (dbName && dbName.value) {
        fromName = dbName.value;
      }
    } catch (e) {
      console.warn('BrevoService: Could not query system_config table for Brevo settings:', e.message);
    }

    this.apiKey = apiKey || null;
    this.fromEmail = fromEmail;
    this.fromName = fromName;

    return { apiKey: this.apiKey, fromEmail: this.fromEmail, fromName: this.fromName };
  }

  async sendEmail({ to, subject, htmlContent, sender }) {
    await this.loadConfig();

    const recipientList = Array.isArray(to)
      ? to.map(r => (typeof r === 'string' ? { email: r } : r))
      : [typeof to === 'string' ? { email: to } : to];

    const senderObj = sender || {
      email: this.fromEmail || 'events@aems.local',
      name: this.fromName || 'AEMS Events'
    };

    // If no real API key is set, log to console in dev mode
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.log('\n========================================');
      console.log('📨 [BREVO REST API - SIMULATED SEND]');
      console.log('To:', recipientList.map(r => r.email).join(', '));
      console.log('Subject:', subject);
      console.log('Sender:', `${senderObj.name} <${senderObj.email}>`);
      console.log('Note: To send real emails, set BREVO_API_KEY in .env or System Settings.');
      console.log('========================================\n');
      return { messageId: `mock-brevo-${Date.now()}`, simulated: true };
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: senderObj,
          to: recipientList,
          subject,
          htmlContent
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('Brevo REST API Error:', data);
        return { success: false, error: data.message || 'Brevo API call failed', details: data };
      }

      console.log('Email sent successfully via Brevo REST API. Message ID:', data.messageId);
      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error('Failed to dispatch email via Brevo REST API:', error.message || error);
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
      console.warn('BrevoService: template lookup failed for event_otp, using fallback:', e.message);
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
              Sent via Brevo REST API &bull; Academy &amp; Employment Management System
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
      console.warn('BrevoService: template lookup failed for event_registration_success, using fallback:', e.message);
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
                CONFIRMED REGISTRATION
              </div>
              <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.3px;">
                You're Registered! 🎉
              </h1>
              <p style="color: #d1fae5; margin: 0; font-size: 15px; font-weight: 400;">
                Your seat has been reserved successfully
              </p>
            </div>

            <!-- Body -->
            <div style="padding: 32px 28px;">
              <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 14px 0;">
                Hello <strong>${registration.name}</strong>,
              </p>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Congratulations! Your registration for <strong>${event.title}</strong> is confirmed. Below are your event access and participation details:
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

              <!-- Event Card -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px; margin: 0 0 24px 0;">
                <h3 style="color: #0f172a; margin: 0 0 14px 0; font-size: 17px; font-weight: 700; line-height: 1.4; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                  ${event.title}
                </h3>
                
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; color: #334155;">
                  <tr>
                    <td style="padding: 6px 0; vertical-align: top; width: 140px; font-weight: 600; color: #64748b;">
                      📅 Date &amp; Time:
                    </td>
                    <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">
                      ${eventDateFormatted}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; vertical-align: top; font-weight: 600; color: #64748b;">
                      👤 Attendee:
                    </td>
                    <td style="padding: 6px 0; color: #0f172a;">
                      <strong>${registration.name}</strong> (${registration.occupation})
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; vertical-align: top; font-weight: 600; color: #64748b;">
                      🏢 Organization:
                    </td>
                    <td style="padding: 6px 0; color: #0f172a;">
                      ${categoryDetail}
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
                <a href="${joinLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35); letter-spacing: 0.2px;">
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
      </html>
    `;

    return this.sendEmail({
      to: { email: registration.email, name: registration.name },
      subject,
      htmlContent
    });
  }

  /**
   * Send 24-hour reminder email
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
    const attendeeDetail = `${registration.occupation} (${registration.organization})`;

    try {
      const emailTemplateService = (await import('./email-template.service.js')).default;
      const template = await emailTemplateService.getTemplateByCode('event_reminder');
      if (template && template.is_active && template.body_html) {
        const vars = {
          '{{NAME}}': registration.name,
          '{{EVENT_TITLE}}': event.title,
          '{{EVENT_DATE}}': eventDateFormatted,
          '{{JOIN_LINK}}': joinLink,
          '{{ATTENDEE_DETAIL}}': attendeeDetail
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
      console.warn('BrevoService: template lookup failed for event_reminder, using fallback:', e.message);
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
              Sent via Brevo REST API &bull; Academy &amp; Employment Management System
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

export default new BrevoEmailService();
