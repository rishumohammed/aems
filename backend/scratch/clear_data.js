import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aems',
  multipleStatements: true,
});

// All tables to TRUNCATE (order matters: children first, parents last)
// User accounts, system config, categories, and CMS pages are PRESERVED.
const tablesToClear = [
  // Auth / Security logs
  'auth_logs',
  'audit_logs',
  'terms_privacy_acceptances',

  // Notifications
  'notifications',
  'employer_notifications',

  // Messaging
  'messages',
  'conversations',

  // WhatsApp
  'whatsapp_logs',

  // Notice Board / Live Events
  'notice_board',
  'live_events',

  // Certificates
  'cert_verification_logs',
  'certificates',

  // Public Exam Portal (children first)
  'public_exam_results',
  'public_exam_attempts',
  'public_exam_certificates',
  'public_exam_candidates',
  'public_exam_questions',
  'public_exams',

  // LMS Exam Portal (children first)
  'exam_answers',
  'exam_attempts',
  'exam_slots',
  'exam_questions',
  'exams',

  // Assignments
  'assignment_submissions',
  'assignments',

  // Jobs / Placements / Interviews
  'job_placements',
  'job_interviews',
  'job_applications',
  'jobs',

  // Finance
  'invoice_payments',
  'invoices',
  'expenses',

  // LMS Activity (children first)
  'lesson_progress',
  'enrollments',

  // Course Q&A / Communication
  'course_qa_replies',
  'course_qa',
  'course_announcements',

  // Course Content (children first)
  'course_lessons',
  'course_sections',
  'course_modules',
  'course_prerequisites',
  'courses',

  // CRM / Leads
  'lead_followups',
  'lead_activities',
  'lead_custom_fields',
  'leads',
  'lead_form_configs',

  // Certificates External
  'external_certificates',

  // CMS / Marketing data
  'testimonials',
  'contact_submissions',

  // Social
  'student_social_platform_status',
  'student_social_follows',

  // Misc
  'student_guides',
  'student_job_categories',
];

const PRESERVED = [
  'users', 'user_profiles', 'student_profiles', 'tutor_profiles',
  'employer_profiles', 'sessions', 'system_config', 'course_categories',
  'job_categories', 'public_exam_categories', 'social_platforms',
  'currencies', 'master_standards', 'cert_template_config',
  'institute_info', 'team_members', 'accreditations', 'recruiters',
];

async function clearData() {
  const conn = await pool.getConnection();
  try {
    console.log('🔄 Starting database cleanup...\n');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    let cleared = 0;
    let skipped = 0;

    for (const table of tablesToClear) {
      try {
        const [result] = await conn.query(`TRUNCATE TABLE \`${table}\``);
        console.log(`  ✅ Cleared: ${table}`);
        cleared++;
      } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
          console.log(`  ⚠️  Skipped (table not found): ${table}`);
          skipped++;
        } else {
          console.error(`  ❌ Error on ${table}: ${err.message}`);
        }
      }
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log(`\n✅ Done! Cleared ${cleared} tables, skipped ${skipped} missing tables.`);
    console.log(`\n🔒 Preserved tables:`);
    PRESERVED.forEach(t => console.log(`   - ${t}`));

  } finally {
    conn.release();
    await pool.end();
  }
}

clearData().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
