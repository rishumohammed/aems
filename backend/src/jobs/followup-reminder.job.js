import cron from 'node-cron';
import emailService from '../services/email.service.js';
import { pool } from '../db/connection.js';

export const initFollowupJob = () => {
  // Schedule to run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily follow-up reminder job...');
    
    try {
      // Get all agents who have pending follow-ups today
      const [agents] = await pool.query(`
        SELECT DISTINCT u.id, u.email, u.name
        FROM users u
        JOIN lead_followups f ON u.id = f.agent_id
        WHERE DATE(f.scheduled_at) = CURDATE() AND f.status = 'pending'
      `);

      for (const agent of agents) {
        // Get follow-ups for this specific agent
        const [followups] = await pool.query(`
          SELECT f.*, l.name as lead_name, l.phone as lead_phone
          FROM lead_followups f
          JOIN leads l ON f.lead_id = l.id
          WHERE DATE(f.scheduled_at) = CURDATE() AND f.status = 'pending' AND f.agent_id = ?
        `, [agent.id]);

        if (followups.length > 0) {
          const followupList = followups.map(f => `
            - ${f.lead_name} (${f.lead_phone}) at ${new Date(f.scheduled_at).toLocaleTimeString()}: ${f.note || 'No note'}
          `).join('\n');

          const subject = `Brixify: Your Follow-up Reminders for Today`;
          const html = `<p>Hello ${agent.name},</p><p>You have ${followups.length} follow-ups scheduled for today:</p><pre>${followupList}</pre><p>Good luck!<br>- Brixify CRM System</p>`;

          try {
            await emailService.sendRawEmail(agent.email, subject, html);
            console.log(`Sent reminder email to ${agent.email}`);
          } catch (mailError) {
            console.error(`Failed to send email to ${agent.email}:`, mailError);
          }
        }
      }
    } catch (error) {
      console.error('Error in follow-up reminder job:', error);
    }
  });
};
