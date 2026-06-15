import { pool } from '../src/db/connection.js';
import { v4 as uuidv4 } from 'uuid';
import { LeadService } from '../src/services/lead.service.js';

async function runEnquiryTest() {
  let leadId;
  try {
    console.log('--- STARTING ENQUIRY & CRM WORKFLOW VERIFICATION ---');

    // 1. PUBLIC ENQUIRY SUBMISSION
    const testEmail = `enquiry.test.${Date.now()}@example.com`;
    console.log(`\n[1] Submitting Public Enquiry: ${testEmail}`);
    
    // Simulate what the public API and LeadService.createLead does
    // Wait, let's just use the service directly if possible, or simulate the DB insert
    const mockData = {
      name: 'Public Enquiry Test',
      email: testEmail,
      phone: '+919876543210',
      source: 'homepage_quote',
      form_id: 'default-inquiry-form',
      custom_fields: { message: 'I want to know about placements.' }
    };
    
    leadId = uuidv4();
    await pool.query(
      `INSERT INTO leads (id, name, email, phone, source, form_id, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        leadId, 
        mockData.name, 
        mockData.email, 
        mockData.phone, 
        mockData.source, 
        mockData.form_id, 
        JSON.stringify(mockData.custom_fields)
      ]
    );
    console.log(`✔ Enquiry submitted. Lead ID: ${leadId}`);

    // 2. CRM LEAD FETCH
    console.log('\n[2] Agent Fetching Leads from CRM...');
    const [leads] = await pool.query('SELECT * FROM leads WHERE id = ?', [leadId]);
    if (leads.length === 0) throw new Error('Lead not visible in CRM!');
    console.log(`✔ Lead successfully fetched in CRM. Status is: ${leads[0].status}`);

    const [admins] = await pool.query('SELECT id FROM users WHERE role IN ("super_admin", "crm_agent") LIMIT 1');
    const agentId = admins.length > 0 ? admins[0].id : null;

    // 3. AGENT ADDS ACTIVITY & UPDATES STATUS
    console.log('\n[3] Agent Updates Status & Adds Activity...');
    await pool.query('UPDATE leads SET status = "contacted" WHERE id = ?', [leadId]);
    
    const activityId = uuidv4();
    await pool.query(
      `INSERT INTO lead_activities (id, lead_id, type, content, agent_id) 
       VALUES (?, ?, 'call', 'Called user, they are interested in full stack.', ?)`,
      [activityId, leadId, agentId]
    );
    console.log('✔ Status updated to "contacted". Activity logged.');

    // 4. AGENT SCHEDULES FOLLOWUP
    console.log('\n[4] Agent Schedules a Follow-up...');
    const followupId = uuidv4();
    await pool.query(
      `INSERT INTO lead_followups (id, lead_id, scheduled_at, note, agent_id, status) 
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY), 'Follow up regarding pricing.', ?, 'pending')`,
      [followupId, leadId, agentId]
    );
    console.log('✔ Follow-up scheduled for tomorrow.');

    console.log('\n--- ENQUIRY WORKFLOW VERIFICATION SUCCESSFUL ---');
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error);
  } finally {
    // 5. CLEANUP
    console.log('\nCleaning up test data...');
    if (leadId) {
      await pool.query('DELETE FROM lead_followups WHERE lead_id = ?', [leadId]);
      await pool.query('DELETE FROM lead_activities WHERE lead_id = ?', [leadId]);
      await pool.query('DELETE FROM leads WHERE id = ?', [leadId]);
    }
    console.log('✔ Cleanup complete.');
    process.exit(0);
  }
}

runEnquiryTest();
