import enrollmentService from '../src/services/enrollment.service.js';
import { pool } from '../src/db/connection.js';

async function testConversion() {
  const leadId = '34d7fdcc-5b8f-4b2a-9137-94b0b1ad515a';
  const courseId = '871a8fe8-508c-4ca8-bfa1-79e324e68de8';
  
  try {
    // Get lead data
    const [leads] = await pool.query('SELECT * FROM leads WHERE id = ?', [leadId]);
    if (leads.length === 0) {
      console.error('Lead not found');
      return;
    }
    const lead = leads[0];
    
    console.log('Converting Lead:', lead.name);
    
    const result = await enrollmentService.enrollStudent({
      leadId: lead.id,
      studentData: {
        name: lead.name,
        email: lead.email || `test-${Date.now()}@example.com`,
        phone: lead.phone
      },
      courseId: courseId,
      pricing: {
        amount: 499.00
      },
      payment: {
        mode: 'offline',
        amountPaid: 499.00,
        offlineType: 'cash',
        reference: 'TEST-CONV-001'
      }
    });
    
    console.log('Conversion Successful!');
    console.log('Result:', result);
    
    // Verify lead status
    const [updatedLead] = await pool.query('SELECT status FROM leads WHERE id = ?', [leadId]);
    console.log('New Lead Status:', updatedLead[0].status);
    
  } catch (err) {
    console.error('Conversion Failed:', err.message);
  } finally {
    process.exit(0);
  }
}

testConversion();
