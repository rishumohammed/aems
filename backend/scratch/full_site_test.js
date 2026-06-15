/**
 * AEMS Full Site API Test
 * Tests every major API endpoint and reports results
 */

const BASE = 'http://localhost:5000/api';
let accessToken = null;
let tutorToken = null;
let studentToken = null;
const results = [];
const cookies = {};

// ─── helpers ─────────────────────────────────────────────────────────────────
function extractSetCookie(headers) {
  const raw = headers['set-cookie'] || [];
  const arr = Array.isArray(raw) ? raw : [raw];
  arr.forEach(c => {
    const [kv] = c.split(';');
    const [k, v] = kv.split('=');
    if (k && v) cookies[k.trim()] = v.trim();
  });
}

function buildCookieHeader() {
  return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function req(method, path, body, token, label) {
  const url = `${BASE}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const cookieStr = buildCookieHeader();
  if (cookieStr) headers['Cookie'] = cookieStr;

  const start = Date.now();
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    extractSetCookie(res.headers);
    const ms = Date.now() - start;
    let data;
    try { data = await res.json(); } catch { data = {}; }

    const ok = res.status < 500;
    const tag = ok ? (res.status < 400 ? '✅' : '⚠️') : '❌';
    results.push({ tag, label: label || `${method} ${path}`, status: res.status, ms, note: ok ? '' : JSON.stringify(data).slice(0, 120) });
    return { status: res.status, data };
  } catch (err) {
    results.push({ tag: '💀', label: label || `${method} ${path}`, status: 0, ms: 0, note: err.message });
    return { status: 0, data: {} };
  }
}

// ─── test groups ─────────────────────────────────────────────────────────────

async function testHealth() {
  console.log('\n📡 [1] HEALTH & SERVER');
  const r = await fetch('http://localhost:5000/health');
  const d = await r.json();
  results.push({ tag: r.status === 200 ? '✅' : '❌', label: 'GET /health', status: r.status, ms: 0, note: d.status });
}

async function testPublicRoutes() {
  console.log('\n🌐 [2] PUBLIC ROUTES');
  await req('GET', '/public/hero',            null, null, 'GET /public/hero');
  await req('GET', '/public/categories',      null, null, 'GET /public/categories');
  await req('GET', '/public/courses/featured',null, null, 'GET /public/courses/featured');
  await req('GET', '/public/courses',         null, null, 'GET /public/courses (listing)');
  await req('GET', '/public/testimonials',    null, null, 'GET /public/testimonials');
  await req('GET', '/public/stats',           null, null, 'GET /public/stats');
  await req('GET', '/public/about',           null, null, 'GET /public/about');
  await req('GET', '/public/team',            null, null, 'GET /public/team');
  await req('GET', '/public/faqs',            null, null, 'GET /public/faqs');
  await req('GET', '/public/jobs',            null, null, 'GET /public/jobs');
}

async function testAuth() {
  console.log('\n🔐 [3] AUTHENTICATION');

  // Login as admin
  const admin = await req('POST', '/auth/login',
    { email: 'admin@aems.local', password: 'Admin@1234' },
    null, 'POST /auth/login (admin)');
  if (admin.data?.accessToken) {
    accessToken = admin.data.accessToken;
    results[results.length - 1].note = `Role: ${admin.data.user?.role}`;
  }

  // GET /me
  await req('GET', '/auth/me', null, accessToken, 'GET /auth/me (admin)');

  // Token refresh
  await req('POST', '/auth/refresh', {}, null, 'POST /auth/refresh');

  // Forgot password (just API check)
  await req('POST', '/auth/forgot-password',
    { email: 'nobody@test.com' }, null, 'POST /auth/forgot-password');
}

async function testDashboard() {
  console.log('\n📊 [4] DASHBOARD');
  await req('GET', '/dashboard', null, accessToken, 'GET /dashboard (admin stats)');
}

async function testCourses() {
  console.log('\n📚 [5] COURSES (LMS Admin)');
  const list = await req('GET', '/lms/courses', null, accessToken, 'GET /lms/courses');
  await req('GET', '/lms/categories', null, accessToken, 'GET /lms/categories');

  // Try getting first course detail
  const courses = list.data?.data || list.data?.courses || [];
  if (courses.length > 0) {
    const cid = courses[0].id || courses[0].slug;
    await req('GET', `/lms/courses/${cid}`, null, accessToken, `GET /lms/courses/:id (${cid})`);
    await req('GET', `/lms/courses/${cid}/curriculum`, null, accessToken, 'GET /lms/courses/:id/curriculum');
  }
}

async function testStudents() {
  console.log('\n👨‍🎓 [6] STUDENTS');
  const list = await req('GET', '/admin/students', null, accessToken, 'GET /admin/students');
  const students = list.data?.data || list.data?.students || list.data || [];
  if (Array.isArray(students) && students.length > 0) {
    const sid = students[0].id || students[0].user_id;
    if (sid) await req('GET', `/admin/students/${sid}`, null, accessToken, `GET /admin/students/:id`);
  }
}

async function testEnrollments() {
  console.log('\n📋 [7] ENROLLMENTS');
  await req('GET', '/enrollments', null, accessToken, 'GET /enrollments');
}

async function testExams() {
  console.log('\n📝 [8] EXAMS');
  const list = await req('GET', '/exams', null, accessToken, 'GET /exams');
  const exams = list.data?.exams || list.data?.data || list.data || [];
  if (Array.isArray(exams) && exams.length > 0) {
    const eid = exams[0].id;
    if (eid) await req('GET', `/exams/${eid}`, null, accessToken, `GET /exams/:id`);
  }
  await req('GET', '/exams/submissions', null, accessToken, 'GET /exams/submissions');
}

async function testCerts() {
  console.log('\n🏅 [9] CERTIFICATES');
  await req('GET', '/certs', null, accessToken, 'GET /certs');
  // Public verify
  await req('GET', '/certs/verify/TEST-0000', null, null, 'GET /certs/verify/:code (invalid)');
}

async function testJobs() {
  console.log('\n💼 [10] JOBS');
  await req('GET', '/jobs', null, null, 'GET /jobs (public)');
  await req('GET', '/admin/jobs', null, accessToken, 'GET /admin/jobs');
  await req('GET', '/admin/job-categories', null, accessToken, 'GET /admin/job-categories');
}

async function testCRM() {
  console.log('\n📞 [11] CRM');
  await req('GET', '/crm/leads', null, accessToken, 'GET /crm/leads');
  await req('GET', '/crm/analytics', null, accessToken, 'GET /crm/analytics');
}

async function testFinance() {
  console.log('\n💰 [12] FINANCE');
  await req('GET', '/admin/finance/summary', null, accessToken, 'GET /admin/finance/summary');
  await req('GET', '/admin/finance/invoices', null, accessToken, 'GET /admin/finance/invoices');
  await req('GET', '/expenses', null, accessToken, 'GET /expenses');
}

async function testMessages() {
  console.log('\n💬 [13] MESSAGES');
  await req('GET', '/messages/threads', null, accessToken, 'GET /messages/threads');
}

async function testNotifications() {
  console.log('\n🔔 [14] NOTIFICATIONS');
  await req('GET', '/notifications', null, accessToken, 'GET /notifications');
}

async function testAdminRoutes() {
  console.log('\n⚙️  [15] ADMIN CONFIG & ABOUT');
  await req('GET', '/admin/about/hero', null, accessToken, 'GET /admin/about/hero');
  await req('GET', '/admin/about/team', null, accessToken, 'GET /admin/about/team');
  await req('GET', '/admin/about/faqs', null, accessToken, 'GET /admin/about/faqs');
  await req('GET', '/admin/config', null, accessToken, 'GET /admin/config');
  await req('GET', '/admin/course-categories', null, accessToken, 'GET /admin/course-categories');
  await req('GET', '/admin/tutor-approvals', null, accessToken, 'GET /admin/tutor-approvals');
}

async function testEmployers() {
  console.log('\n🏢 [16] EMPLOYERS');
  await req('GET', '/employers', null, accessToken, 'GET /employers (list)');
}

async function testBilling() {
  console.log('\n🧾 [17] BILLING');
  await req('GET', '/billing/invoices', null, accessToken, 'GET /billing/invoices');
  await req('GET', '/billing/plans', null, null, 'GET /billing/plans (public)');
}

async function testProctoring() {
  console.log('\n🎥 [18] PROCTORING');
  await req('GET', '/proctoring/sessions', null, accessToken, 'GET /proctoring/sessions');
}

async function testInterviews() {
  console.log('\n🤝 [19] INTERVIEWS');
  await req('GET', '/interviews', null, accessToken, 'GET /interviews');
}

async function testFrontendPages() {
  console.log('\n🖥️  [20] FRONTEND PAGES (HTTP status checks)');
  const pages = [
    '/',
    '/login',
    '/register',
    '/about',
    '/courses',
    '/jobs',
    '/verify',
    '/verify-certificate',
    '/contact',
    '/forgot-password',
    '/privacy-policy',
    '/terms-of-service',
    '/dashboard',
    '/dashboard/profile',
    '/dashboard/notifications',
    '/dashboard/interviews',
    '/dashboard/certificates',
    '/dashboard/courses',
    '/dashboard/exams',
    '/dashboard/exams/create',
    '/dashboard/exams/grading',
    '/dashboard/student',
    '/dashboard/tutor',
    '/dashboard/students',
    '/dashboard/leads',
    '/dashboard/admin/tutor-approvals',
    '/dashboard/sessions',
    '/dashboard/employer',
    '/dashboard/jobs',
    '/dashboard/expenses',
    '/dashboard/communication',
    '/admin/tutor-approvals',
  ];

  for (const page of pages) {
    const start = Date.now();
    try {
      const r = await fetch(`http://localhost:3000${page}`, { redirect: 'follow' });
      const ms = Date.now() - start;
      const ok = r.status < 500;
      results.push({
        tag: ok ? '✅' : '❌',
        label: `FRONTEND ${page}`,
        status: r.status,
        ms,
        note: ''
      });
    } catch (err) {
      results.push({ tag: '💀', label: `FRONTEND ${page}`, status: 0, ms: 0, note: err.message });
    }
  }
}

// ─── main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('         AEMS FULL SITE TEST SUITE');
  console.log(`         ${new Date().toLocaleString()}`);
  console.log('═══════════════════════════════════════════════════════');

  await testHealth();
  await testPublicRoutes();
  await testAuth();
  await testDashboard();
  await testCourses();
  await testStudents();
  await testEnrollments();
  await testExams();
  await testCerts();
  await testJobs();
  await testCRM();
  await testFinance();
  await testMessages();
  await testNotifications();
  await testAdminRoutes();
  await testEmployers();
  await testBilling();
  await testProctoring();
  await testInterviews();
  await testFrontendPages();

  // ── Report ──────────────────────────────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('                    TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════');

  const pass   = results.filter(r => r.tag === '✅').length;
  const warn   = results.filter(r => r.tag === '⚠️').length;
  const fail   = results.filter(r => r.tag === '❌').length;
  const dead   = results.filter(r => r.tag === '💀').length;

  // Print each
  for (const r of results) {
    const note = r.note ? `  → ${r.note}` : '';
    console.log(`  ${r.tag}  [${String(r.status).padEnd(3)}]  ${r.label.padEnd(55)} ${r.ms ? r.ms+'ms' : ''}${note}`);
  }

  console.log('\n───────────────────────────────────────────────────────');
  console.log(`  Total: ${results.length}  |  ✅ Pass: ${pass}  |  ⚠️  Warn: ${warn}  |  ❌ Fail: ${fail}  |  💀 Dead: ${dead}`);
  console.log('═══════════════════════════════════════════════════════');

  if (fail > 0 || dead > 0) {
    console.log('\n🔴 FAILURES:');
    results.filter(r => r.tag === '❌' || r.tag === '💀').forEach(r => {
      console.log(`   ${r.tag} ${r.label} [${r.status}] ${r.note}`);
    });
  }
  if (warn > 0) {
    console.log('\n🟡 WARNINGS (4xx - expected auth/not-found):');
    results.filter(r => r.tag === '⚠️').forEach(r => {
      console.log(`   ⚠️  ${r.label} [${r.status}] ${r.note}`);
    });
  }
}

main().catch(console.error);
