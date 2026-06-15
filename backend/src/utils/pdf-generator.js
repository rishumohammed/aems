import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoicePDF = async (invoice, student, course, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.fillColor('#444444')
       .fontSize(20)
       .text('AEMS Academy', 50, 57)
       .fontSize(10)
       .text('123 Education Lane, Knowledge City', 200, 65, { align: 'right' })
       .text('Bangalore, India', 200, 80, { align: 'right' })
       .moveDown();

    doc.lineCap('butt')
       .moveTo(50, 100)
       .lineTo(550, 100)
       .stroke();

    // Invoice Info
    doc.fontSize(15).text('INVOICE', 50, 120);
    doc.fontSize(10)
       .text(`Invoice Number: ${invoice.invoice_number || invoice.id.split('-')[0].toUpperCase()}`, 50, 140)
       .text(`Date: ${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : 'N/A'}`, 50, 155)
       .text(`Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}`, 50, 170)
       .text(`Status: ${(invoice.payment_status || 'unknown').toUpperCase()}`, 50, 185);

    // Student Info
    doc.fontSize(12).text('Bill To:', 350, 120);
    doc.fontSize(10)
       .text(student.name, 350, 140)
       .text(student.email, 350, 155)
       .text(student.phone, 350, 170);

    // Table Header
    doc.fontSize(12).text('Description', 50, 220);
    doc.text('Amount', 450, 220, { align: 'right' });

    doc.lineCap('butt')
       .moveTo(50, 240)
       .lineTo(550, 240)
       .stroke();

    // Item
    doc.fontSize(10).text(course.title, 50, 260);
    doc.text(`INR ${invoice.amount}`, 450, 260, { align: 'right' });

    // Summary
    doc.lineCap('butt')
       .moveTo(350, 300)
       .lineTo(550, 300)
       .stroke();

    doc.text('Total Amount:', 350, 320);
    doc.text(`INR ${invoice.amount}`, 450, 320, { align: 'right' });

    doc.text('Amount Paid:', 350, 335);
    doc.text(`INR ${invoice.amount_paid}`, 450, 335, { align: 'right' });

    doc.fillColor('#d93025').text('Balance Due:', 350, 350);
    doc.text(`INR ${invoice.balance_due}`, 450, 350, { align: 'right' });

    // Footer
    doc.fillColor('#444444')
       .fontSize(10)
       .text('Thank you for choosing AEMS Academy!', 50, 700, { align: 'center', width: 500 });

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};
