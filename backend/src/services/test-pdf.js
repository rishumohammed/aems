import { pool } from '../db/connection.js';
import invoiceService from './invoice.service.js';

async function test() {
  try {
    const [invoices] = await pool.query('SELECT id FROM invoices WHERE pdf_path IS NULL LIMIT 1');
    if (invoices.length > 0) {
      console.log('Generating PDF for invoice:', invoices[0].id);
      const url = await invoiceService.generatePDF(invoices[0].id);
      console.log('Success. URL:', url);
    } else {
      console.log('No invoices with null pdf_path found.');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    process.exit(0);
  }
}

test();
