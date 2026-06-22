import { pool } from './src/db/connection.js';

pool.query(`
      SELECT 
        id as transaction_id,
        'revenue' COLLATE utf8mb4_unicode_ci as source,
        'credit' COLLATE utf8mb4_unicode_ci as flow_type,
        amount,
        mode COLLATE utf8mb4_unicode_ci as payment_mode,
        reference COLLATE utf8mb4_unicode_ci as reference_number,
        paid_at as transaction_date,
        'Course Enrollment Payment' COLLATE utf8mb4_unicode_ci as description,
        paid_at as created_at
      FROM invoice_payments
      WHERE status IN ('approved', 'successful')

      UNION ALL

      SELECT
        id as transaction_id,
        'expense' COLLATE utf8mb4_unicode_ci as source,
        type COLLATE utf8mb4_unicode_ci as flow_type,
        amount,
        payment_mode COLLATE utf8mb4_unicode_ci,
        reference_number COLLATE utf8mb4_unicode_ci,
        date as transaction_date,
        description COLLATE utf8mb4_unicode_ci,
        created_at
      FROM expenses
      WHERE deleted_at IS NULL

      ORDER BY transaction_date DESC, created_at DESC
`).then(([rows]) => {
  console.log('Result length:', rows.length);
  process.exit(0);
}).catch(e => {
  console.error(e.message);
  process.exit(1);
});
