import cron from 'node-cron';
import { pool } from '../db/connection.js';
import brevoService from '../services/brevo.service.js';

/**
 * Dispatches 24-hour reminder emails for upcoming events
 */
export const checkAndSendEventReminders = async (specificEventId = null) => {
  try {
    let query = `
      SELECT 
        r.id as registration_id,
        r.name as candidate_name,
        r.email as candidate_email,
        r.phone as candidate_phone,
        r.occupation,
        r.organization,
        e.id as event_id,
        e.title as event_title,
        e.meet_link,
        e.event_start,
        e.image_url
      FROM event_registrations r
      JOIN events e ON r.event_id = e.id
      WHERE e.status = 'published'
        AND r.is_verified = TRUE
    `;

    const params = [];

    if (specificEventId) {
      // Manual trigger for a specific event
      query += ` AND e.id = ?`;
      params.push(specificEventId);
    } else {
      // Automated job: Send to verified attendees whose event is within the next 24 hours
      // and who haven't received a 24h reminder yet
      query += `
        AND r.reminder_sent_24h = FALSE
        AND e.event_start <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
        AND e.event_start > NOW()
      `;
    }

    const [attendees] = await pool.query(query, params);

    if (attendees.length === 0) {
      return { sent: 0, message: 'No pending event reminders found.' };
    }

    console.log(`[Event Reminder Job] Found ${attendees.length} candidate(s) due for 24h reminder.`);

    let sentCount = 0;
    for (const attendee of attendees) {
      try {
        await brevoService.sendEventReminderEmail({
          registration: {
            name: attendee.candidate_name,
            email: attendee.candidate_email,
            occupation: attendee.occupation,
            organization: attendee.organization
          },
          event: {
            id: attendee.event_id,
            title: attendee.event_title,
            meet_link: attendee.meet_link,
            event_start: attendee.event_start
          }
        });

        // Mark as sent
        await pool.query(`
          UPDATE event_registrations 
          SET reminder_sent_24h = TRUE, reminder_sent_at = NOW() 
          WHERE id = ?
        `, [attendee.registration_id]);

        sentCount++;
      } catch (err) {
        console.error(`Failed to send reminder to ${attendee.candidate_email}:`, err.message);
      }
    }

    console.log(`[Event Reminder Job] Successfully dispatched ${sentCount} reminder email(s).`);
    return { sent: sentCount, total: attendees.length };
  } catch (error) {
    console.error('Error in Event Reminder Job:', error);
    throw error;
  }
};

/**
 * Initialize recurring cron job (Runs every 15 minutes)
 */
export const initEventReminderJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      await checkAndSendEventReminders();
    } catch (e) {
      console.error('Failed to run scheduled event reminder check:', e);
    }
  });

  console.log('✅ Event 24h reminder cron job scheduled (every 15 mins)');
};
