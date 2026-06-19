import { pool } from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

export const LeadService = {
  async createLead({ name, email, phone, source, form_id, course_interest_ids = [], custom_fields = {} }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Check for existing lead by phone (Deduplication)
      const [existingLeads] = await connection.query(
        'SELECT id, assigned_to FROM leads WHERE phone = ? LIMIT 1',
        [phone]
      );

      let leadId;
      let assignedTo;

      if (existingLeads.length > 0) {
        leadId = existingLeads[0].id;
        assignedTo = existingLeads[0].assigned_to;
        
        // Update existing lead name/email if they were empty, append/update course interests, and reopen
        await connection.query(
          'UPDATE leads SET name = COALESCE(NULLIF(name, ""), ?), email = COALESCE(NULLIF(email, ""), ?), status = "open", course_interest_ids = ? WHERE id = ?',
          [name, email, JSON.stringify(course_interest_ids), leadId]
        );
      } else {
        leadId = uuidv4();
        // 2. Round-Robin Assignment
        assignedTo = await this.getNextAgent(connection);

        await connection.query(
          'INSERT INTO leads (id, name, email, phone, source, form_id, assigned_to, status, course_interest_ids) VALUES (?, ?, ?, ?, ?, ?, ?, "open", ?)',
          [leadId, name, email, phone, source, form_id, assignedTo, JSON.stringify(course_interest_ids)]
        );
      }

      // 3. Store Custom Fields
      if (custom_fields && Object.keys(custom_fields).length > 0) {
        for (const [key, value] of Object.entries(custom_fields)) {
          // Check if custom field exists
          const [existingFields] = await connection.query(
            'SELECT id FROM lead_custom_fields WHERE lead_id = ? AND field_key = ?',
            [leadId, key]
          );

          if (existingFields.length > 0) {
            await connection.query(
              'UPDATE lead_custom_fields SET field_value = ? WHERE id = ?',
              [String(value), existingFields[0].id]
            );
          } else {
            await connection.query(
              'INSERT INTO lead_custom_fields (id, lead_id, field_key, field_value) VALUES (?, ?, ?, ?)',
              [uuidv4(), leadId, key, String(value)]
            );
          }
        }
      }

      // 4. Log Activity
      await connection.query(
        'INSERT INTO lead_activities (id, lead_id, type, content) VALUES (?, ?, "note", ?)',
        [uuidv4(), leadId, `Lead ${existingLeads.length > 0 ? 'updated' : 'created'} via ${source}`]
      );

      await connection.commit();
      return { id: leadId, assignedTo };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async getNextAgent(connection) {
    // Round-robin: Find agent with role 'crm_agent' and fewest 'open' leads
    const [agents] = await connection.query(`
      SELECT u.id, COUNT(l.id) as lead_count
      FROM users u
      LEFT JOIN leads l ON u.id = l.assigned_to AND l.status = 'open'
      WHERE u.role = 'crm_agent' AND u.status = 'active'
      GROUP BY u.id
      ORDER BY lead_count ASC
      LIMIT 1
    `);

    if (agents.length > 0) {
      return agents[0].id;
    }
    
    // Fallback: Super Admin if no agents found
    const [admins] = await connection.query(
      "SELECT id FROM users WHERE role = 'super_admin' LIMIT 1"
    );
    return admins.length > 0 ? admins[0].id : null;
  }
};
