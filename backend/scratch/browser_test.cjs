/**
 * AEMS Full Browser Test Suite — Playwright
 * Visually tests every major page and user flow
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Use 127.0.0.1 explicitly — Chromium resolves "localhost" to 127.0.0.1 (IPv4)
// but Nuxt dev may listen on ::1 (IPv6). Using 127.0.0.1 forces IPv4.
const BASE = 'http://127.0.0.1:3000';
const API  = 'http://127.0.0.1:5000/api';
const ADMIN_EMAIL = 'admin@aems.local';
const ADMIN_PASS  = 'Admin@1234';

const SS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

const results = [];
let page, browser, context;

// ── helpers ──────────────────────────────────────────────────────────────────
function log(icon, label, note = '') {
  const entry = { icon, label, note, ts: new Date().toISOString() };
  results.push(entry);
  console.log(`  ${icon}  ${label}${note ? '  →  ' + note : ''}`);
}

async function screenshot(name) {
  const file = path.join(SS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function goto(url, label) {
  try {
    const resp = await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const status = resp?.status();
    await page.waitForTimeout(800);
    if (status >= 500) {
      log('❌', label || url, `HTTP ${status}`);
    } else {
      log('✅', label || url, `HTTP ${status}`);
    }
    return status;
  } catch (err) {
    log('💀', label || url, err.message.slice(0, 80));
    return 0;
  }
}

async function checkVisible(selector, desc) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    log('✅', `  [UI] ${desc}`, 'visible');
  } catch {
    log('⚠️', `  [UI] ${desc}`, 'NOT FOUND');
  }
}

async function checkNoConsoleErrors() {
  // checked via listener
}

// ── TESTS ────────────────────────────────────────────────────────────────────

async function testPublicPages() {
  console.log('\n═══ 🌐  PUBLIC PAGES ═══');

  // Home
  await goto('/', 'Home Page (/)');
  await checkVisible('h1, .hero, [class*="hero"], [class*="landing"]', 'Hero section');
  await screenshot('01_home');

  // About
  await goto('/about', 'About Page (/about)');
  await screenshot('02_about');

  // Courses listing
  await goto('/courses', 'Courses Listing (/courses)');
  await screenshot('03_courses');

  // Jobs
  await goto('/jobs', 'Jobs Board (/jobs)');
  await screenshot('04_jobs');

  // Contact
  await goto('/contact', 'Contact Page (/contact)');
  await screenshot('05_contact');

  // Verify Certificate
  await goto('/verify', 'Verify Certificate (/verify)');
  await screenshot('06_verify');

  // Privacy & Terms
  await goto('/privacy-policy', 'Privacy Policy');
  await goto('/terms-of-service', 'Terms of Service');

  // 404
  await goto('/this-page-does-not-exist-xyz', '404 Page');
  await screenshot('07_404');
}

async function testAuthFlow() {
  console.log('\n═══ 🔐  AUTH FLOW ═══');

  // Login Page
  await goto('/login', 'Login Page');
  await checkVisible('form, [class*="login"]', 'Login form');
  await screenshot('08_login');

  // Test wrong credentials
  await page.fill('input[type="email"]', 'wrong@test.com');
  await page.fill('input[type="password"]', 'wrongpass');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  const errVisible = await page.$('[class*="alert"], [class*="error"], .v-alert');
  log(errVisible ? '✅' : '⚠️', '  [UI] Error shown for wrong credentials', errVisible ? 'error alert visible' : 'no error shown');
  await screenshot('09_login_error');

  // Test correct credentials
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASS);
  await screenshot('10_login_filled');
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  try {
    await page.waitForURL(`${BASE}/dashboard**`, { timeout: 10000 });
    log('✅', '  [FLOW] Login → Dashboard redirect', 'success');
  } catch {
    const url = page.url();
    log('⚠️', '  [FLOW] Login redirect', `stayed at ${url}`);
  }
  await page.waitForTimeout(1500);
  await screenshot('11_post_login_dashboard');

  // Forgot Password
  await goto('/forgot-password', 'Forgot Password Page');
  await checkVisible('form, input[type="email"]', 'Forgot password form');
  await screenshot('12_forgot_password');

  // Register
  await goto('/register', 'Register Page');
  await checkVisible('form', 'Register form');
  await screenshot('13_register');
}

async function testDashboardPages() {
  console.log('\n═══ 📊  DASHBOARD PAGES ═══');

  const pages = [
    ['/dashboard', 'Dashboard Home'],
    ['/dashboard/profile', 'Profile'],
    ['/dashboard/notifications', 'Notifications'],
    ['/dashboard/certificates', 'Certificates'],
    ['/dashboard/courses', 'Courses (Admin View)'],
    ['/dashboard/exams', 'Exams List'],
    ['/dashboard/exams/create', 'Create Exam'],
    ['/dashboard/exams/grading', 'Exam Grading'],
    ['/dashboard/students', 'Students List'],
    ['/dashboard/leads', 'CRM Leads'],
    ['/dashboard/jobs', 'Jobs Management'],
    ['/dashboard/interviews', 'Interviews'],
    ['/dashboard/expenses', 'Expenses'],
    ['/dashboard/sessions', 'Live Sessions'],
    ['/dashboard/communication', 'Communication'],
    ['/dashboard/employer', 'Employer Portal'],
    ['/dashboard/admin/tutor-approvals', 'Tutor Approvals'],
    ['/dashboard/admin/invoices', 'Invoice Management (Admin)'],
  ];

  for (let i = 0; i < pages.length; i++) {
    const [route, label] = pages[i];
    await goto(route, label);
    const ssName = `14_dash_${route.replace(/\//g, '_').replace(/^_/, '')}`;
    await screenshot(ssName);
  }
}

async function testTutorDashboard() {
  console.log('\n═══ 👨‍🏫  TUTOR DASHBOARD ═══');
  await goto('/dashboard/tutor', 'Tutor Dashboard');
  await screenshot('15_tutor_dashboard');
  await goto('/dashboard/tutor/courses', 'Tutor Courses');
  await screenshot('16_tutor_courses');
}

async function testStudentDashboard() {
  console.log('\n═══ 👨‍🎓  STUDENT DASHBOARD ═══');
  await goto('/dashboard/student', 'Student Dashboard');
  await screenshot('17_student_dashboard');
  await goto('/dashboard/student/payments', 'Student Payments/Invoices');
  await screenshot('17_student_payments');
}

async function testNavigationLinks() {
  console.log('\n═══ 🔗  NAVIGATION ═══');

  await goto('/', 'Home — nav test');
  await page.waitForTimeout(500);

  // Check nav links exist
  const navLinks = await page.$$eval('a[href]', links =>
    links.filter(l => l.href.includes('localhost:3000')).map(l => l.href).slice(0, 20)
  );
  log('✅', `  [NAV] Found ${navLinks.length} navigation links on home`);

  // Try clicking courses nav link
  const coursesLink = page.locator('a[href="/courses"]').first();
  if (await coursesLink.count() > 0) {
    await coursesLink.click();
    await page.waitForTimeout(1000);
    log('✅', '  [NAV] Courses nav link works', page.url());
  } else {
    log('⚠️', '  [NAV] No /courses nav link found on home');
  }
}

async function testFormsInteraction() {
  console.log('\n═══ 📝  FORM INTERACTIONS ═══');

  // Contact form
  await goto('/contact', 'Contact Form Test');
  await page.waitForTimeout(500);

  const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[placeholder*="Name" i]').first();
  if (await nameInput.count() > 0) {
    await nameInput.fill('Test User');
    log('✅', '  [FORM] Contact name field fillable');
  } else {
    log('⚠️', '  [FORM] Contact name field not found');
  }

  // Verify certificate form
  await goto('/verify', 'Certificate Verify Form');
  await page.waitForTimeout(500);
  const certInput = page.locator('input').first();
  if (await certInput.count() > 0) {
    await certInput.fill('AEMS-TEST-001');
    log('✅', '  [FORM] Certificate verify field fillable');
    await screenshot('18_verify_form_filled');
  }
}

async function testAPIFromBrowser() {
  console.log('\n═══ 🔌  API CALLS FROM BROWSER CONTEXT ═══');

  // Navigate to dashboard and check if API calls succeed
  await goto('/dashboard', 'Dashboard — API test');
  await page.waitForTimeout(2000);

  // Check network responses via page evaluation
  const apiCallResult = await page.evaluate(async () => {
    try {
      const r = await fetch('http://localhost:5000/health');
      return { ok: r.ok, status: r.status };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });

  log(apiCallResult.ok ? '✅' : '❌',
    '  [API] Backend reachable from browser context',
    `status: ${apiCallResult.status || apiCallResult.error}`
  );

  // Check localStorage for auth token
  const token = await page.evaluate(() => localStorage.getItem('at'));
  log(token ? '✅' : '⚠️', '  [AUTH] Access token in localStorage', token ? 'present' : 'missing (not logged in?)');
}

async function testLogout() {
  console.log('\n═══ 🚪  LOGOUT ═══');

  // Find and click logout
  await goto('/dashboard', 'Dashboard before logout');
  await page.waitForTimeout(1000);

  // Click on the user avatar to open the dropdown menu first
  const avatar = page.locator('.user-pill-avatar').first();
  if (await avatar.count() > 0) {
    await avatar.click();
    await page.waitForTimeout(500); // wait for menu animation
  }

  const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), [data-logout], .v-list-item:has-text("Logout")').first();
  if (await logoutBtn.count() > 0) {
    await logoutBtn.click();
    await page.waitForTimeout(2000);
    const url = page.url();
    log(url.includes('/login') ? '✅' : '⚠️', '  [FLOW] Logout → redirect', url);
    await screenshot('19_post_logout');
  } else {
    log('⚠️', '  [FLOW] Logout button not found via text selector');
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     AEMS PLAYWRIGHT BROWSER TEST SUITE            ║');
  console.log(`║     ${new Date().toLocaleString().padEnd(44)} ║`);
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log(`Screenshots → ${SS_DIR}\n`);

  const consoleErrors = [];

  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AEMS-BrowserTest/1.0'
  });
  page = await context.newPage();

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(`[PAGE ERROR] ${err.message}`));

  try {
    await testPublicPages();
    await testAuthFlow();
    await testDashboardPages();
    await testTutorDashboard();
    await testStudentDashboard();
    await testNavigationLinks();
    await testFormsInteraction();
    await testAPIFromBrowser();
    await testLogout();
  } catch (err) {
    log('💀', 'FATAL TEST ERROR', err.message);
    console.error(err);
  } finally {
    await browser.close();
  }

  // ── Report ──────────────────────────────────────────────────────────────
  console.log('\n\n╔═══════════════════════════════════════════════════╗');
  console.log('║                 BROWSER TEST RESULTS              ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  const pass = results.filter(r => r.icon === '✅').length;
  const warn = results.filter(r => r.icon === '⚠️').length;
  const fail = results.filter(r => r.icon === '❌').length;
  const dead = results.filter(r => r.icon === '💀').length;

  console.log(`  Total: ${results.length}  |  ✅ ${pass}  |  ⚠️  ${warn}  |  ❌ ${fail}  |  💀 ${dead}\n`);

  if (fail > 0 || dead > 0) {
    console.log('🔴 FAILURES:');
    results.filter(r => ['❌','💀'].includes(r.icon)).forEach(r => {
      console.log(`   ${r.icon}  ${r.label}  ${r.note}`);
    });
  }

  if (warn > 0) {
    console.log('\n🟡 WARNINGS:');
    results.filter(r => r.icon === '⚠️').forEach(r => {
      console.log(`   ⚠️   ${r.label}  ${r.note}`);
    });
  }

  if (consoleErrors.length > 0) {
    console.log(`\n🔴 BROWSER CONSOLE ERRORS (${consoleErrors.length}):`);
    [...new Set(consoleErrors)].slice(0, 15).forEach(e => console.log('   •', e.slice(0, 120)));
  } else {
    console.log('\n✅ No browser console errors detected');
  }

  console.log(`\n📸 ${fs.readdirSync(SS_DIR).length} screenshots saved to: ${SS_DIR}`);
}

main().catch(console.error);
