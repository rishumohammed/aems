import { pool } from './src/db/connection.js';

async function clearDb() {
  const connection = await pool.getConnection();
  try {
    console.log('Clearing database...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = [
      'user_profiles',
      'student_profiles',
      'sessions',
      'course_categories',
      'courses',
      'course_sections',
      'course_lessons',
      'enrollments',
      'lesson_progress',
      'leads',
      'lead_custom_fields',
      'lead_activities',
      'lead_form_configs',
      'exams',
      'exam_questions',
      'exam_attempts',
      'certificates',
      'job_categories',
      'jobs',
      'job_applications',
      'invoices',
      'invoice_payments',
      'expenses',
      'institute_info',
      'team_members',
      'accreditations',
      'recruiters',
      'testimonials',
      'contact_submissions',
      'lead_followups',
      'external_certificates',
      'whatsapp_logs',
      'course_prerequisites',
      'course_qa',
      'course_qa_replies',
      'course_announcements',
      'conversations',
      'messages',
      'notifications',
      'student_social_follows',
      'student_social_platform_status',
      'student_guides',
      'exam_slots',
      'exam_answers',
      'social_platforms',
      'system_config',
      'cert_template_config',
      'cert_verification_logs',
      'assignments',
      'interviews'
    ];

    for (const table of tables) {
      try {
        await connection.query(`TRUNCATE TABLE ${table}`);
        console.log(`Truncated table: ${table}`);
      } catch (err) {
        console.log(`Table ${table} skip/error: ${err.message}`);
      }
    }

    // Delete all users except 'admin@aems.local'
    await connection.query("DELETE FROM users WHERE email != 'admin@aems.local'");
    console.log("Deleted all users except 'admin@aems.local'");

    // Truncate any other tables dynamically (except 'users')
    const [rows] = await connection.query('SHOW TABLES');
    const dbName = process.env.DB_NAME || 'aems_db';
    // Access the table name key regardless of exact casing
    for (const row of rows) {
      const tableName = row[Object.keys(row)[0]];
      if (tableName !== 'users' && !tables.includes(tableName)) {
        try {
          await connection.query(`TRUNCATE TABLE ${tableName}`);
          console.log(`Truncated dynamic table: ${tableName}`);
        } catch (e) {
          console.log(`Failed to truncate dynamic table ${tableName}: ${e.message}`);
        }
      }
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database clearance complete.');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

clearDb();
