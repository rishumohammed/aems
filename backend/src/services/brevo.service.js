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
    const subject = `Your Verification Code for ${eventTitle}: ${otp}`;
    const displayName = name || 'Learner';

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
    const subject = `Registration Confirmed: ${event.title} 🎉`;
    const eventDateFormatted = new Date(event.event_start).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const categoryDetail = registration.occupation === 'Student'
      ? `College: ${registration.organization}`
      : registration.occupation === 'Working'
      ? `Company: ${registration.organization}`
      : `Institution: ${registration.organization}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #eef2f6;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 36px 30px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 8px;">🎉</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">You're Registered!</h1>
            <p style="color: #d1fae5; margin: 8px 0 0 0; font-size: 15px;">Your seat has been reserved</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 30px;">
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
              Hello <strong>${registration.name}</strong>,
            </p>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              Congratulations! Your registration for <strong>${event.title}</strong> is confirmed. Below are your event access and participation details:
            </p>

            <!-- Event Card -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; margin: 24px 0;">
              <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 18px;">${event.title}</h3>
              
              <div style="margin-bottom: 10px; color: #475569; font-size: 14px;">
                <strong>📅 Date &amp; Time:</strong> ${eventDateFormatted}
              </div>
              <div style="margin-bottom: 10px; color: #475569; font-size: 14px;">
                <strong>👤 Attendee:</strong> ${registration.name} (${registration.occupation})
              </div>
              <div style="margin-bottom: 10px; color: #475569; font-size: 14px;">
                <strong>🏢 Organization:</strong> ${categoryDetail}
              </div>
              <div style="color: #475569; font-size: 14px;">
                <strong>📍 Mode:</strong> Online Live Session
              </div>
            </div>

            <!-- Join Notice -->
            <div style="background: #e0e7ff; border-left: 4px solid #4f46e5; border-radius: 4px; padding: 14px 18px; margin: 24px 0;">
              <p style="color: #3730a3; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>Important:</strong> When the event start time arrives, the <strong>"Join Event"</strong> button will become active on the event page. You can click to enter the meeting room directly.
              </p>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
              🔔 <strong>Reminder notice:</strong> We will also email you an automated reminder with the direct join link <strong>24 hours before the event starts</strong>.
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

  /**
   * Send 24-hour reminder email
   */
  async sendEventReminderEmail({ registration, event }) {
    const subject = `Reminder: ${event.title} is Starting Tomorrow! 🚀`;
    const eventDateFormatted = new Date(event.event_start).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const joinLink = event.meet_link || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events`;

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
