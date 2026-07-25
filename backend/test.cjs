const { chromium } = require('playwright');
async function run() {
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[type="email"]', 'john@aems.local');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await page.goto('http://localhost:3000/dashboard/admin/course-approvals');
  await page.waitForTimeout(3000);
  const text = await page.innerText('body');
  console.log('CONTENT:', text.substring(0, 500));
  await browser.close();
}
run().catch(console.error);
