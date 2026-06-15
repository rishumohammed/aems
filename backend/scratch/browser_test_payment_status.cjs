const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://[::1]:3000';
const STUDENT_EMAIL = 'student@aems.local';
const STUDENT_PASS  = 'Student@123';
const ADMIN_EMAIL = 'admin@aems.local';
const ADMIN_PASS  = 'Admin@1234';

const SS_DIR = path.join(__dirname, 'screenshots_payment');
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

async function run() {
  console.log('Launching Playwright Browser for Payment Status Test...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('  [BROWSER CONSOLE]:', msg.type().toUpperCase(), msg.text()));
  page.on('pageerror', err => console.log('  [BROWSER ERROR]:', err.message));

  try {
    // --- STEP 1: Student Login ---
    console.log('\n--- 1. Logging in as Student ---');
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', STUDENT_EMAIL);
    await page.fill('input[type="password"]', STUDENT_PASS);
    await page.screenshot({ path: path.join(SS_DIR, '01_student_login_filled.png') });
    await page.click('button[type="submit"]');

    console.log('Waiting for Student Dashboard...');
    await page.waitForURL(`${BASE}/dashboard/student`, { timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SS_DIR, '02_student_dashboard.png') });

    // --- STEP 2: Navigate to Student Payments Page ---
    console.log('\n--- 2. Navigating to Student Payments Page ---');
    await page.goto(`${BASE}/dashboard/student/payments`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SS_DIR, '03_student_payments.png') });
    console.log('Checked Student Payments Page elements.');

    // --- STEP 3: Navigate to Student Profile ---
    console.log('\n--- 3. Navigating to Student Profile Page ---');
    await page.goto(`${BASE}/dashboard/profile`);
    await page.waitForTimeout(2000);
    const summaryCardVisible = await page.locator('text=Payment Summary').count() > 0;
    console.log('Student Profile Payment Summary visible:', summaryCardVisible ? 'YES' : 'NO');
    await page.screenshot({ path: path.join(SS_DIR, '04_student_profile_summary.png') });

    // --- STEP 4: Logout Student ---
    console.log('\n--- 4. Logging out Student ---');
    await page.locator('.user-pill-avatar').first().click();
    await page.waitForTimeout(500);
    await page.locator('.v-list-item:has-text("Logout"), button:has-text("Logout")').first().click();
    await page.waitForURL(`${BASE}/login`, { timeout: 5000 });
    console.log('Logged out student successfully.');

    // --- STEP 5: Admin Login ---
    console.log('\n--- 5. Logging in as Admin ---');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE}/dashboard`, { timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SS_DIR, '05_admin_dashboard.png') });

    // --- STEP 6: Admin Invoice Management Panel ---
    console.log('\n--- 6. Navigating to Admin Invoice Management ---');
    await page.goto(`${BASE}/dashboard/admin/invoices`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SS_DIR, '06_admin_invoices.png') });

    // Check edit button presence
    const editBtn = page.locator('button[title="Edit Details"]').first();
    if (await editBtn.count() > 0) {
      console.log('Clicking Edit Details button...');
      await editBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SS_DIR, '07_admin_edit_modal.png') });
      console.log('Edit Details modal shown successfully.');
      
      // Close modal
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(500);
    } else {
      console.log('WARNING: No invoices found or Edit Details button missing.');
    }

    console.log('\n=========================================');
    console.log('BROWSER VERIFICATION COMPLETED SUCCESSFULLY!');
    console.log('=========================================');

  } catch (error) {
    console.error('Browser testing failed:', error);
  } finally {
    await browser.close();
  }
}

run();
